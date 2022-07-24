import {
  ConversationEntity,
  FileEntity,
  GenderEnum,
  MessageEntity,
  MessageEnum,
} from "../entities";
import {
  mapMessageStatus,
  mapMessageType,
  mapTypeMessage,
} from "../utils/utils";
import { sConversationEntity, sMessageEntity } from "./storageEntity";
import { sKeywordMessageEntity } from "./storageEntity/sKeywordMessageEntity";
import { sPendingMesage } from "./storageEntity/sPendingMessage";

export const conversationToStorageEntity = (
  conversation: ConversationEntity
): sConversationEntity => {
  const isLastMessageText =
    conversation.lastMessage &&
    +conversation.lastMessage.type === MessageEnum.text;
  // console.log(conversation, isLastMessageText);
  return {
    id: conversation.id,
    avatar: conversation.avatar,
    name: conversation.name,
    users: conversation.users.map((user) => {
      return {
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        name: user.name,
      };
    }),
    to: conversation.lastMessage?.to || "",
    isGroup: conversation.users.length > 2,
    unreadMessage: 0,
    lastMessageId: conversation.lastMessage?.id || "",
    lastMessageContent: conversation.lastMessage
      ? isLastMessageText
        ? (conversation.lastMessage.content as string)
        : mapMessageType(+conversation.lastMessage.type)
      : "",
    lastMessageStatus: conversation.lastMessage?.status || 0,
    lastMessageType: conversation.lastMessage?.type || 0,
    lastMessageTime: conversation.lastMessage?.create_at
      ? +new Date(conversation.lastMessage.create_at).getTime()
      : +Date.now(),
    lastMessageSender: conversation.lastMessage?.sender || "",
    totalMessage: conversation.totalMessage,
  };
};

export const conversationStorageToEntity = (
  conversation: sConversationEntity
): ConversationEntity => {
  // console.log(conversation.users);
  return {
    id: conversation.id,
    avatar: conversation.avatar,
    name: conversation.name,
    users: conversation.users.map((user) => {
      return {
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        name: user.name,
        gender: GenderEnum.male,
      };
    }),
    lastMessage: {
      sender: conversation.lastMessageSender,
      id: conversation.lastMessageId,
      content: conversation.lastMessageContent,
      status: conversation.lastMessageStatus,
      type: conversation.lastMessageType,
      create_at: conversation.lastMessageTime,
      to: conversation.to,
    },
    totalMessage: conversation.totalMessage,
  };
};

export const messageStorageToEntity = (
  message: sMessageEntity
): MessageEntity => {
  return {
    ...message,
    create_at: message.create_at || Date.now(),
  };
};

export const messageEntityToPendingStorage = (
  message: MessageEntity
): sPendingMesage => {
  return {
    clientMsgId: message.clientId || Date.now().toString(),
    sender: message.sender,
    type: message.type,
    status: message.status,
    content: +message.type === MessageEnum.text ? message.content : {...message.content as FileEntity},
    conversation_id: message.conversation_id || "",
    to: message.to || "",
  };
};

export const pendingMessageStorageToEntity = (
  pendingMsg: sPendingMesage
): MessageEntity => {
  return {
    ...pendingMsg,
    create_at: parseInt(pendingMsg.clientMsgId),
  };
};

export const messageEntityToStorage = (
  message: MessageEntity
): sMessageEntity => {
  return {
    id: message.id,
    create_at: new Date(message.create_at || 0).getTime(),
    clientMsgId: message.clientId || Date.now().toString(),
    sender: message.sender,
    type: message.type,
    status: message.status,
    content: +message.type === MessageEnum.text ? message.content : {...message.content as FileEntity},
    conversation_id: message.conversation_id || "",
    to: message.to,
  };
};

export const messageToKeywordMessage = (
  message: sMessageEntity,
  keyword: string
): sKeywordMessageEntity => {
  return {
    msgId: message.id!,
    keyword: keyword,
    convId: message.conversation_id!,
    msgType: message.type,
  };
};
