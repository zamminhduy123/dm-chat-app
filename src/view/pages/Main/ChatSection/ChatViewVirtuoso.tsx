import React from "react";
import { Virtuoso } from "react-virtuoso";
import { MessageEntity, MessageStatus, UserEntity } from "../../../../entities";
import { chatInSameTime } from "../../../../utils/chatInSameTime";
import useTranslation from "../../../adapter/translation.adapter";
import LoadingMessage from "../../../components/LoadingSkeleton/LoadingMessage";
import ScrollBottomButton from "../../../components/ScrollBottomButton/ScrollBottomButton";
import TimeDivider from "../../../components/TimeDivider/TimeDivider";
import Message from "./Message";

interface ChatViewProps {
  messageList: MessageEntity[];
  conversationMember: UserEntity[];
  resendMessageHandler: Function;
  hasNextPage: Boolean;
  isNextPageLoading: Boolean;
  loadNextPage: Function;
  totalMessage: number;
  scrollToIndex?: number;
}

const ChatViewVirtuoso = ({
  messageList,
  conversationMember,
  resendMessageHandler,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  totalMessage,
  scrollToIndex,
}: ChatViewProps) => {
  const virtuosoRef = React.useRef<any>(null);
  const [atBottom, setAtBottom] = React.useState(false);
  const [showButton, setShowButton] = React.useState(false);
  const { t } = useTranslation();

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const showButtonTimeout = React.useRef<NodeJS.Timeout>(
    setTimeout(() => {}, 0)
  );
  const lastIndex = React.useRef(messageList.length - 1);
  const [behavior, setBehavior] = React.useState("smooth");

  const [oldListLength, setOldListLength] = React.useState(messageList.length);
  const [firstItemIndex, setFirstItemIndex] = React.useState(
    Math.max(totalMessage - oldListLength, 0)
  );

  // console.log("FIRST", firstItemIndex, messageList, totalMessage);
  const [isLoadMore, setIsLoadMore] = React.useState(false);

  const prependItems = React.useCallback(() => {
    // console.log(isLoadMore, firstItemIndex);
    if (firstItemIndex > 0 && !isLoadMore) {
      setIsLoadMore(true);
      setTimeout(() => {
        loadNextPage();
      }, 500);
    }
  }, [firstItemIndex]);

  React.useEffect(() => {
    if (isLoadMore) {
      const usersToPrepend = Math.min(totalMessage - oldListLength, 15);
      const nextFirstItemIndex = Math.max(firstItemIndex - usersToPrepend, 0);

      console.log("PREPEND", usersToPrepend, nextFirstItemIndex);

      setFirstItemIndex(nextFirstItemIndex);
      setOldListLength(messageList.length);
      setIsLoadMore(false);
    } else {
      setFirstItemIndex(Math.max(totalMessage - messageList.length, 0));
      setOldListLength(messageList.length);
      virtuosoRef.current.scrollToIndex({
        index: Number.MAX_VALUE,
        align: "end",
        behavior: "auto",
      });
      // scrollRef.current?.scrollIntoView({
      //   block: "center",
      //   behavior: "auto",
      // });
    }
  }, [messageList]);
  console.log("FIRST", firstItemIndex, messageList, totalMessage);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    console.log("SCROLL TO ", scrollToIndex);
    if (scrollToIndex !== undefined && scrollToIndex >= 0) {
      timeout = setTimeout(() => {
        virtuosoRef.current.scrollToIndex({
          index: scrollToIndex,
          align: "center",
          behavior: "smooth",
        });
      }, 300);
    } else {
    }
    return () => clearTimeout(timeout);
  }, [scrollToIndex]);

  // console.log(totalMessage);

  return (
    <div className="chat-view-container" key={messageList[0].conversation_id}>
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "100%", width: "100%" }}
        data={messageList}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={15}
        startReached={prependItems}
        alignToBottom
        components={{
          Header: () => {
            if (firstItemIndex !== 0) {
              return <LoadingMessage />;
            }
            return <div></div>;
          },
          Footer: () => {
            if (conversationMember.length <= 2) {
              return (
                <div
                  ref={scrollRef}
                  style={{
                    fontWeight: "600",
                    fontSize: "9px",
                    color: "#CACACA",
                    textTransform: "uppercase",
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  {t("This conversation is end to end encrypted")}
                </div>
              );
            } else {
              return <div ref={scrollRef} style={{ height: "10px" }}></div>;
            }
          },
        }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          if (
            target.scrollTop + 200 <
            target.scrollHeight - target.clientHeight
          ) {
            if (!showButton) {
              setShowButton(true);
            }
          } else {
            if (showButton) {
              setShowButton(false);
            }
          }
        }}
        atBottomStateChange={(bottom) => {
          console.log("BOTTOM", bottom);
          setAtBottom(bottom);
        }}
        itemContent={(realIndex, message) => {
          let index = messageList.findIndex((m) => {
            if (message.id && m.id) {
              return message.id === m.id;
            } else {
              return message.clientId === m.clientId;
            }
          });

          let hasAvatar = false,
            hasTime = false,
            notSameDayBefore = false,
            notSameDayAfter = false,
            nextCreateAt,
            prevCreateAt;
          if (index < messageList.length - 1) {
            nextCreateAt = messageList[index + 1].create_at;

            hasTime = !chatInSameTime(
              +messageList[index].create_at,
              +nextCreateAt
            );
            notSameDayAfter = !chatInSameTime(
              +messageList[index].create_at,
              +nextCreateAt,
              24 * 60 * 60 * 1000
            );
          }
          if (index === messageList.length - 1) {
            hasTime = true;
          } else {
            if (messageList[index].sender === messageList[index + 1].sender)
              hasTime = false;
            else hasTime = true;
          }

          if (index === 0) {
            hasAvatar = true;
          } else {
            prevCreateAt = messageList[index - 1].create_at;
            notSameDayBefore = !chatInSameTime(
              +messageList[index].create_at,
              +prevCreateAt,
              24 * 60 * 60 * 1000
            );
            if (messageList[index].sender != messageList[index - 1].sender) {
              hasAvatar = true;
            }
          }
          return (
            <div key={message.clientId || message.id}>
              {index === 0 || notSameDayBefore ? (
                <TimeDivider date={new Date(message.create_at || 0)} />
              ) : null}
              <Message
                conversationMember={conversationMember}
                message={message}
                hasAvatar={hasAvatar || notSameDayBefore}
                hasTime={hasTime || notSameDayAfter}
                resend={
                  +message.status === MessageStatus.ERROR
                    ? resendMessageHandler
                    : void 0
                }
                hasStatus={index === messageList.length - 1}
                isHighlighted={index === scrollToIndex}
              />
              {/* {index === messageList.length - 1 && (
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "9px",
                    color: "#CACACA",
                    textTransform: "uppercase",
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  {t("This conversation is end to end encrypted")}
                </div>
              )} */}
            </div>
          );
        }}
      />
      {showButton && (
        <ScrollBottomButton
          bottom="30px"
          right="40px"
          onClick={() => {
            setShowButton(false);
            // scrollRef.current?.scrollIntoView({
            //   block: "end",
            //   behavior: "auto",
            // });
            virtuosoRef.current.scrollToIndex({
              index: Number.MAX_VALUE,
              align: "end",
              behavior: "auto",
            });
          }}
        />
      )}
    </div>
  );
};

export default ChatViewVirtuoso;
