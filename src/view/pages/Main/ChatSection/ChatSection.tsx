import { t, use } from "i18next";
import React, { useCallback } from "react";
import { MessageController } from "../../../../controller";
import SocketController from "../../../../controller/SocketController/SocketController";
import { ConversationEntity, MessageEntity } from "../../../../entities";
import useClientNetwork from "../../../adapter/useClientNetwork";
import { useMessage } from "../../../adapter/useMessage";
import ChatError from "./ChatError";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatViewVirtuoso from "./ChatViewVirtuoso";

interface ChatSectionProps {
  conversation: ConversationEntity;
  username: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  conversation,
  username,
}: ChatSectionProps) => {
  // console.log("ACTIVE", conversation);

  const { resendMessage } = MessageController.getInstance();
  const resendMessageHandler = useCallback((message: MessageEntity) => {
    if (message) resendMessage(message);
  }, []);

  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    let socketConnectionErrorHandler = () => {
      setErrorMessage("Server error! We are trying to reconnect!");
    };
    let socketConnectionSucessHandler = () => {
      setErrorMessage("");
    };
    SocketController.getInstance().connectError(socketConnectionErrorHandler);
    SocketController.getInstance().connectSuccess(
      socketConnectionSucessHandler
    );
    return () => {
      socketConnectionErrorHandler = () => {};
      socketConnectionSucessHandler = () => {};
    };
  }, []);

  const onDragEnter = () => {};

  const networkError = useClientNetwork();
  let message = "";
  if (errorMessage) message = t(errorMessage);
  if (networkError)
    message = `${t("Cannot connect to server")}. ${t(
      "Please check your internet connection"
    )}!`;

  // console.log("MESSAGE", message);

  //infinity scroll handler
  const {
    messages: messageList,
    hasMore,
    selected,
    totalMessage,
  } = useMessage();
  const messageLoading = React.useRef(false);
  const loadMoreMessage = async () => {
    if (messageList.length && !messageLoading.current) {
      messageLoading.current = true;
      await MessageController.getInstance().loadMoreMessageFromConversation(
        new Date(messageList[0].create_at).getTime()
      );
    }
    return;
  };
  React.useEffect(() => {
    messageLoading.current = false;
    // console.log(messageList);

    return () => {
      // console.log("SECTION UNMOUNT");
    };
  }, [messageList]);

  React.useEffect(() => {
    console.log(selected);
    if (selected) {
      if (messageList.findIndex((m) => m.id === selected.id) <= 0) {
        MessageController.getInstance().loadToMessage(selected);
      }
    }
  }, [selected]);

  //header
  const [showHeader, setShowHeader] = React.useState(true);

  return (
    <main className="chat-section-container">
      <div className={`header-container ${showHeader ? "show" : "hide"}`}>
        <header
          className={`chat-section-header ${showHeader ? "show" : "hide"}`}
        >
          <ChatHeader
            userNumber={conversation.users.length}
            lastMessageSendingTime={
              conversation.lastMessage
                ? +conversation.lastMessage.create_at
                : Date.now()
            }
            info={
              conversation.users.filter((u) => u.username !== username)[0].phone
            }
            avatars={
              conversation.users.length <= 2
                ? conversation.users
                    .filter((u) => u.username !== username)
                    .map((u) => u.avatar)
                : conversation.users.map((u) => u.avatar)
            }
            isStranger={conversation.id === ""}
            showHeader={showHeader}
            toggleHeader={() => setShowHeader((prev) => !prev)}
            name={conversation.name}
          />
        </header>
      </div>
      {!message ? null : (
        <div style={{ margin: "0px 16px" }}>
          <ChatError message={message} />
        </div>
      )}
      <article id="message-view">
        <div className="chat-section-chat-view-container">
          {messageList.length ? (
            <ChatViewVirtuoso
              messageList={messageList}
              conversationMember={conversation.users}
              resendMessageHandler={resendMessageHandler}
              hasNextPage={hasMore}
              isNextPageLoading={false}
              loadNextPage={loadMoreMessage}
              totalMessage={totalMessage}
              scrollToIndex={
                selected
                  ? messageList.findIndex((m) => m.id === selected.id)
                  : undefined
              }
            />
          ) : null}
        </div>
        <div className="chat-section-chat-input-container">
          <ChatInput
            receiver={conversation.users}
            conversation={conversation}
            sender={username}
          />
        </div>
      </article>
    </main>
  );
};

export default ChatSection;
