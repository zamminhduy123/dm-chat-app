import { Message, MessageEntity, MessageStatus } from "../../entities";
import { NewMessage } from "../../entities/type/NewMessage";

export const conversationModelToEntity = (
  messages: Message[]
): MessageEntity[] => {
  if (messages.length == 0) {
    return [];
  }
  const result: MessageEntity[] = [];
  for (const message of messages) {
    result.push({
      id: message.getId(),
      sender: message.getSender(),
      type: message.getType(),
      content: message.getContent(),
      create_at: message.getCreateAt(),
      status: message.getStatus(),
      conversation_id: message.getConversationId(),
    });
  }
  return result;
};

export const newMessageToMessageEntity = (
  newMessage: NewMessage,
  to: string[] = []
): MessageEntity => {
  return {
    sender: newMessage.sender,
    type: newMessage.type,
    content: newMessage.content,
    conversation_id: newMessage.conversation_id || "",
    to: to,
    clientId: newMessage.clientID,
    status: MessageStatus.SENDING,
    create_at: new Date().getTime(),
  };
};
