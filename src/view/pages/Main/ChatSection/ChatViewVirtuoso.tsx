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

  const showButtonTimeout = React.useRef<NodeJS.Timeout>(
    setTimeout(() => {}, 0)
  );

  React.useEffect(() => {
    clearTimeout(showButtonTimeout.current);
    if (!atBottom) {
      showButtonTimeout.current = setTimeout(() => setShowButton(true), 500);
    } else {
      setShowButton(false);
    }
    return () => {
      clearTimeout(showButtonTimeout.current);
    };
  }, [atBottom, setShowButton]);

  //   const [scrollTo, setScrollTo] = React.useState(messageList.length - 1);
  const lastIndex = React.useRef(messageList.length - 1);
  const [align, setAlign] = React.useState("center");
  const [behavior, setBehavior] = React.useState("auto");

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
        index: messageList.length - 1,
        align,
        behavior,
      });
    }
  }, [messageList]);

  console.log(
    "FIRST",
    firstItemIndex,
    messageList.length,
    totalMessage,
    scrollToIndex
  );

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    console.log("SCROLL TO ", scrollToIndex);
    if (scrollToIndex !== undefined && scrollToIndex >= 0) {
      timeout = setTimeout(() => {
        virtuosoRef.current.scrollToIndex({
          index: scrollToIndex,
          align,
          behavior: "auto",
        });
      }, 300);
    } else {
    }
    return () => clearTimeout(timeout);
  }, [scrollToIndex]);

  return (
    <div className="chat-view-container" key={messageList[0].conversation_id}>
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "100%", willChange: "transform" }}
        data={messageList}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={14}
        startReached={prependItems}
        atBottomStateChange={(bottom) => {
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
              {index === 0 && firstItemIndex != 0 ? <LoadingMessage /> : null}
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
              {index === messageList.length - 1 &&
              conversationMember.length === 2 ? (
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "9px",
                    color: "#CACACA",
                    textTransform: "uppercase",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  {t("This conversation is end to end encrypted")}
                </div>
              ) : null}
              {index === messageList.length - 1 && (
                <div style={{ height: "10px" }}></div>
              )}
            </div>
          );
        }}
      />
      {showButton ? (
        <ScrollBottomButton
          bottom="30px"
          right="40px"
          onClick={() => {
            virtuosoRef.current
              ? virtuosoRef.current.scrollToIndex({
                  index: messageList.length - 1,
                  behavior: "auto",
                })
              : null;
          }}
        />
      ) : null}
    </div>
  );
};

export default ChatViewVirtuoso;
