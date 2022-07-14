import { t, use } from "i18next";
import React, { useCallback } from "react";
import { MessageController } from "../../../../controller";
import SocketController from "../../../../controller/SocketController/SocketController";
import {
  ConversationEntity,
  MessageEntity,
  MessageEnum,
  UserEntity,
} from "../../../../entities";
import { NewMessage } from "../../../../entities/type/NewMessage";
import {
  generateClientId,
  mapMessageType,
  mapTypeMessage,
} from "../../../../utils/utils";
import useAuthApp from "../../../adapter/useAuthApp";
import useClientNetwork from "../../../adapter/useClientNetwork";
import { useMessage } from "../../../adapter/useMessage";
import DropContainer from "../../../components/DropContainer/DropContainer";
import ChatError from "./ChatError";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatViewVirtuoso from "./ChatViewVirtuoso";

interface ChatSectionProps {
  conversation: ConversationEntity;
  scrollToMsgId?: number;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  conversation,
  scrollToMsgId,
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
  if (errorMessage) message = errorMessage;
  if (networkError)
    message = `${t("Cannot connect to server")}. ${t(
      "Please check your internet connection"
    )}!`;

  // console.log("MESSAGE", message);

  const { user } = useAuthApp();

  const users = conversation.users;

  //infinity scroll handler
  const { messages : messageList, hasMore } = useMessage();
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
    // console.log(scrollToMsgId, messageList[0]);
    if (scrollToMsgId && messageList.length)
      MessageController.getInstance().loadUntilReachId(messageList[0]);
  }, [scrollToMsgId, messageList.length]);

  return (
    <main className="chat-section-container">
      <header className="chat-section-header">
        <ChatHeader
          userNumber={users.length}
          lastMessageSendingTime={
            conversation.lastMessage
              ? +conversation.lastMessage.create_at
              : Date.now()
          }
          avatars={
            users.length <= 2
              ? users.filter((u) => u.username !== user).map((u) => u.avatar)
              : users.map((u) => u.avatar)
          }
          name={conversation.name}
        />
      </header>
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
              conversationMember={users}
              resendMessageHandler={resendMessageHandler}
              hasNextPage={hasMore}
              isNextPageLoading={false}
              loadNextPage={loadMoreMessage}
              totalMessage={+conversation.totalMessage}
              scrollToIndex={messageList.findIndex(
                (m) => m.id === scrollToMsgId
              )}
            />
          ) : null}
        </div>
        <div className="chat-section-chat-input-container">
          <ChatInput
            receiver={users}
            conversation={conversation}
            sender={user}
          />
        </div>
      </article>
    </main>
  );
};

export default ChatSection;
