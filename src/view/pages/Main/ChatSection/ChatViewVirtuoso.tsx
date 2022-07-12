import React from "react";
import { Virtuoso } from "react-virtuoso";
import { MessageEntity, MessageStatus, UserEntity } from "../../../../entities";
import { chatInSameTime } from "../../../../utils/chatInSameTime";
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
  const [align, setAlign] = React.useState("start");
  const [behavior, setBehavior] = React.useState("auto");

  const [oldListLength, setOldListLength] = React.useState(messageList.length);
  const [firstItemIndex, setFirstItemIndex] = React.useState(
    Math.max(totalMessage - oldListLength, 0)
  );

  // console.log("FIRST", firstItemIndex, messageList, totalMessage);
  const [isLoadMore, setIsLoadMore] = React.useState(false);

  const prependItems = React.useCallback(() => {
    console.log(isLoadMore, firstItemIndex);
    if (firstItemIndex > 0 && !isLoadMore) {
      setIsLoadMore(true);
      loadNextPage();
    }
  }, [firstItemIndex]);

  React.useEffect(() => {
    if (isLoadMore) {
      const usersToPrepend = Math.max(totalMessage - oldListLength, 0);
      const nextFirstItemIndex = Math.max(firstItemIndex - usersToPrepend, 0);

      console.log("PREPEND", usersToPrepend, nextFirstItemIndex);

      setFirstItemIndex(nextFirstItemIndex);
      setOldListLength(messageList.length);
      setIsLoadMore(false);
    } else {
      if (firstItemIndex !== Math.max(totalMessage - messageList.length, 0)) {
        setFirstItemIndex(Math.max(totalMessage - messageList.length, 0));
      }
      if (oldListLength !== messageList.length) {
        setOldListLength(messageList.length);
      }
    }
  }, [messageList]);
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (scrollToIndex && scrollToIndex >= 0) {
      console.log("SCROLL TO ", scrollToIndex);
      setTimeout(() => {
        timeout = virtuosoRef.current.scrollToIndex({
          index: scrollToIndex,
          align,
          behavior: "smooth",
        });
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [scrollToIndex]);

  // console.log("FIRST", firstItemIndex);

  // React.useEffect(() => {
  //   let index;
  //   if (activeConversation.current !== messageList[0].conversation_id) {
  //     index = messageList.length - 1;
  //     activeConversation.current = messageList[0].conversation_id;
  //   } else {
  //     if (isLoadMore.current) {
  //       index = messageList.length - 1 - lastIndex.current;
  //       isLoadMore.current = false;
  //     } else {
  //       index = messageList.length - 1;
  //     }
  //   }
  //   virtuosoRef.current.scrollToIndex({
  //     index: index,
  //     align,
  //     behavior,
  //   });
  //   lastIndex.current = messageList.length - 1;
  // }, [messageList]);
  // React.useEffect(() => {
  //   virtuosoRef.current.scrollToIndex({
  //     index: messageList.length - 1,
  //     align,
  //     behavior,
  //   });
  //   return () => {
  //     console.log("VIRTOUSO UNMOUNT");
  //   };
  // }, []);

  return (
    <div className="chat-view-container">
      <Virtuoso
        ref={virtuosoRef}
        key={messageList[0].conversation_id}
        style={{ height: "100%" }}
        data={messageList}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={messageList.length - 1}
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
            <>
              {index === 0 || notSameDayBefore ? (
                <TimeDivider
                  date={new Date(messageList[index].create_at || 0)}
                />
              ) : null}
              <Message
                conversationMember={conversationMember}
                message={messageList[index]}
                hasAvatar={hasAvatar || notSameDayBefore}
                hasTime={hasTime || notSameDayAfter}
                resend={
                  +messageList[index].status === MessageStatus.ERROR
                    ? resendMessageHandler
                    : void 0
                }
                hasStatus={index === messageList.length - 1}
              />
            </>
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
