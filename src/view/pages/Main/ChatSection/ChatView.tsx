import React from "react";
import { MessageEntity, MessageStatus, UserEntity } from "../../../../entities";
import { chatInSameTime } from "../../../../utils/chatInSameTime";
import ScrollBottomButton from "../../../components/ScrollBottomButton/ScrollBottomButton";
import TimeDivider from "../../../components/TimeDivider/TimeDivider";
import Message from "./Message";

import {
  AutoSizer,
  List,
  CellMeasurerCache,
  CellMeasurer,
  InfiniteLoader,
  IndexRange,
  WindowScroller,
} from "react-virtualized";
import Spinner from "../../../components/UI/Spinner/Spinner";
import Scrollbars from "react-custom-scrollbars-2";
import { is } from "immer/dist/internal";

interface ChatViewProps {
  messageList: MessageEntity[];
  conversationMember: UserEntity[];
  resendMessageHandler: Function;
  hasNextPage: Boolean;
  isNextPageLoading: Boolean;
  loadNextPage: Function;
}

const ChatView: React.FC<ChatViewProps> = ({
  messageList,
  conversationMember,
  resendMessageHandler,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
}: ChatViewProps) => {
  // console.log(hasNextPage, messageList[messageList.length - 1].clientId);
  const defaultCache = React.useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 48,
      defaultHeight: 200,
      // keyMapper: (row, col) => {
      //   if (row === 0) {
      //     return "loading-row-0";
      //   }
      //   if (row > messageList.length) {
      //     return "empty";
      //   }
      //   return `row-${messageList[row - 1].clientId || messageList[row - 1].id}`;
      // },
    })
  );
  const cache = React.useRef(defaultCache.current);

  const activeConversation = React.useRef(messageList[0].conversation_id);
  const lastIndex = React.useRef(0);

  const oldListHeight = React.useRef(0);
  const [listHeight, setListHeight] = React.useState(0);
  const scrollRef = React.useRef<Scrollbars | null>(null);

  //MAIN LIST REF
  const listRef = React.useRef<List | null>(null);

  const isLoadMore = React.useRef(false);

  React.useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToRow(messageList.length);
      // scrollRef.current?.scrollToBottom();
    }, 10);
    setScrollAppear(false);
  }, [listRef.current]);

  // if (
  //   (activeConversation.current !== messageList[0].conversation_id &&
  //     listRef.current) ||
  //   isLoadMore.current
  // ) {
  //   cache.current.clearAll();
  // }

  // RESIZE ALL
  const resizeAll = () => {
    cache.current.clearAll();
    if (listRef.current) {
      listRef.current.recomputeRowHeights();
    }
  };
  // ROWS RENDER HANDLER
  const renderRow = ({ index, key, style, parent }: any) => {
    // console.log(index, messageList[index - 1]);
    let newIndex = index - 1;
    const isLoading = isLoadingRow({ index });
    let hasAvatar = false,
      hasTime = false,
      notSameDayBefore = false,
      notSameDayAfter = false,
      nextCreateAt,
      prevCreateAt;
    if (index > 0) {
      if (newIndex < messageList.length - 1) {
        nextCreateAt = messageList[newIndex + 1].create_at;

        hasTime = !chatInSameTime(
          +messageList[newIndex].create_at,
          +nextCreateAt
        );
        notSameDayAfter = !chatInSameTime(
          +messageList[newIndex].create_at,
          +nextCreateAt,
          24 * 60 * 60 * 1000
        );
      }
      if (newIndex == messageList.length - 1) {
        hasTime = true;
      } else {
        if (messageList[newIndex].sender === messageList[newIndex + 1].sender)
          hasTime = false;
        else hasTime = true;
      }

      if (newIndex === 0) {
        hasAvatar = true;
      } else {
        prevCreateAt = messageList[newIndex - 1].create_at;
        notSameDayBefore = !chatInSameTime(
          +messageList[newIndex].create_at,
          +prevCreateAt,
          24 * 60 * 60 * 1000
        );
        if (messageList[newIndex].sender != messageList[newIndex - 1].sender) {
          hasAvatar = true;
        }
      }
    }
    return (
      <CellMeasurer
        key={`${isLoading ? "loading-row-0" : key}`}
        cache={cache.current}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        {({ registerChild, measure }) => (
          <div
            ref={(node) =>
              registerChild?.(node ? (node as Element) : undefined)
            }
            style={style}
          >
            {isLoading ? (
              <div className="d-flex flex-center" style={{ width: "100%" }}>
                {hasNextPage && isNextPageLoading ? (
                  <Spinner size="small" />
                ) : null}
              </div>
            ) : (
              <>
                {newIndex === 0 || notSameDayBefore ? (
                  <TimeDivider
                    date={new Date(messageList[newIndex].create_at || 0)}
                  />
                ) : null}
                <Message
                  imageMeasure={measure}
                  conversationMember={conversationMember}
                  message={messageList[newIndex]}
                  hasAvatar={hasAvatar || notSameDayBefore}
                  hasTime={hasTime || notSameDayAfter}
                  resend={
                    +messageList[newIndex].status === MessageStatus.ERROR
                      ? resendMessageHandler
                      : void 0
                  }
                  hasStatus={newIndex === messageList.length - 1}
                />
              </>
            )}
          </div>
        )}
      </CellMeasurer>
    );
  };

  const rowCount = messageList.length + 1;

  const loadMoreRows = loadNextPage;

  const isLoadingRow = ({ index }: any) => index === 0;
  const isRowLoaded = ({ index }: any) => hasNextPage && index !== 0;

  // SCROLL HANDLER
  const [scrollAppear, setScrollAppear] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (activeConversation.current !== messageList[0].conversation_id) {
      listRef.current?.forceUpdateGrid();
      activeConversation.current = messageList[0].conversation_id;
      resizeAll();
      lastIndex.current = messageList.length;
      timeout = setTimeout(() => {
        listRef.current?.scrollToRow(messageList.length);
        // scrollRef.current?.scrollToBottom();
      }, 10);
    } else {
      if (isLoadMore.current) {
        resizeAll();
        console.log(messageList.length - lastIndex.current);
        listRef.current?.scrollToRow(messageList.length - lastIndex.current);
        // const oldScrollTop =
        //   scrollRef.current!.getScrollHeight() - oldListHeight.current;
        // scrollRef.current?.scrollTop(oldScrollTop);
        // oldListHeight.current = scrollRef.current!.getScrollHeight();
        lastIndex.current = messageList.length;
        isLoadMore.current = false;
      } else {
        lastIndex.current = messageList.length;
        cache.current.clear(messageList.length - 1, 0);
        cache.current.clear(messageList.length, 0);
        listRef.current?.scrollToRow(messageList.length);
        // scrollRef.current?.scrollToBottom();
      }
    }
    return () => clearTimeout(timeout);
  }, [messageList]);

  // React.useEffect(() => {
  //   cache.current.clear(messageList.length - 1, 0);
  //   cache.current.clear(messageList.length, 0);
  //   listRef.current?.recomputeRowHeights(messageList.length - 1);
  //   const oldScrollTop =
  //     scrollRef.current!.getScrollHeight() - oldListHeight.current;
  //   scrollRef.current?.scrollTop(oldScrollTop);
  //   oldListHeight.current = listHeight;
  // }, [listHeight]);

  // const handleScroll = ({ target }: any) => {
  //   const { scrollTop, scrollLeft } = target;

  //   const { Grid: grid } = listRef.current!;

  //   grid?.handleScrollEvent({ scrollTop, scrollLeft });
  // };

  return (
    <div key={messageList[0].conversation_id} className="chat-view-container">
      {/* {messageList.length > 0
        ? messageList.map((message, index) => {
            let hasAvatar = false,
              hasTime = false,
              notSameDayBefore = false,
              notSameDayAfter = false,
              nextCreateAt,
              prevCreateAt;
            if (index < messageList.length - 1) {
              nextCreateAt = messageList[index + 1].create_at;

              hasTime = !chatInSameTime(
                new Date(message.create_at),
                new Date(nextCreateAt)
              );
              notSameDayAfter = !chatInSameTime(
                new Date(message.create_at),
                new Date(nextCreateAt),
                10 * 60 * 1000
              );
            }
            if (index == messageList.length - 1) {
              hasTime = true;
            } else {
              if (message.sender === messageList[index + 1].sender)
                hasTime = false;
              else hasTime = true;
            }

            if (index === 0) {
              hasAvatar = true;
            } else {
              prevCreateAt = messageList[index - 1].create_at;
              notSameDayBefore = !chatInSameTime(
                new Date(message.create_at),
                new Date(prevCreateAt),
                10 * 60 * 1000
              );
              if (message.sender != messageList[index - 1].sender) {
                hasAvatar = true;
              }
            }

            return (
              <div
                key={`${message.clientId || message.id}`}
                style={{ width: "100%" }}
              >
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
                />
              </div>
            );
          })
        : null} */}
      {messageList.length ? (
        // <InfiniteLoader
        //   isRowLoaded={({ index }) => {
        //     if (index > 0) {
        //       return true;
        //     }
        //     return false;
        //   }}
        //   loadMoreRows={async () => {
        //     return new Promise<any>(async (resolve, reject) => {
        //       if (listRef.current) {
        //         isLoadMore.current = true;
        //         cache.current.clearAll();
        //         await loadMoreRows();
        //       }
        //       resolve(1);
        //     });
        //   }}
        //   threshold={1}
        //   rowCount={rowCount}
        // >
        //   {({ onRowsRendered, registerChild }) => {
        //     return (

        <AutoSizer>
          {({ width, height }) => (
            <>
              {/* <Scrollbars
                ref={scrollRef}
                className="custom-scrollbar"
                style={{ width, height }}
                onScroll={({ target }: any) => {
                  const { scrollTop, scrollLeft } = target;
                  listRef.current?.Grid?.handleScrollEvent({ scrollTop });
                }}
                renderTrackHorizontal={(props) => (
                  <div {...props} style={{ display: "none" }} />
                )}
                renderThumbHorizontal={(props) => (
                  <div {...props} style={{ display: "none" }} />
                )}
              > */}
              <List
                className="virtual-list"
                ref={(node) => {
                  listRef.current = node;
                }}
                width={width}
                height={height}
                // autoHeight
                rowHeight={cache.current.rowHeight}
                rowRenderer={renderRow}
                rowCount={rowCount}
                deferredMeasurementCache={cache.current}
                onScroll={({ clientHeight, scrollHeight, scrollTop }: any) => {
                  console.log("SCROLL HEIGHT", scrollHeight);
                  // setListHeight(scrollHeight);
                  if (scrollTop + 10 < scrollHeight - clientHeight) {
                    setScrollAppear(true);
                  } else {
                    setScrollAppear(false);
                  }

                  if (scrollTop === 0 && scrollAppear) {
                    // cache.current.clearAll();
                    isLoadMore.current = true;
                    loadMoreRows();
                  }
                }}
              />
              {/* </Scrollbars> */}
              {scrollAppear && listRef.current ? (
                <ScrollBottomButton
                  bottom="30px"
                  right="40px"
                  onClick={() => {
                    scrollRef.current?.scrollToBottom();
                    // listRef.current?.scrollToPosition(listHeight.current);
                    listRef.current!.scrollToRow(rowCount - 1);
                    setScrollAppear(false);
                  }}
                />
              ) : null}
            </>
          )}
        </AutoSizer>
      ) : //   );
      // }}
      //   </InfiniteLoader>
      null}
    </div>
  );
};

export default ChatView;
