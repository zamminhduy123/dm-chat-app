import { sMessageEntity } from "./sMessageEntity";
import { sUserEntity } from "./sUserEntity";

export type sConversationEntity = {
  id: string;
  name: string;
  avatar: string;
  users: sUserEntity[];
  unreadMessage: number;
  isGroup: Boolean;
  lastMessageId: string;
  lastMessageContent: string;
  lastMessageStatus: number;
  lastMessageType: number;
  lastMessageTime: number;
  lastMessageSender: string;
  totalMessage: number;
  to: string;
};
