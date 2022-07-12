import { MessageEntity } from "../message";
import { UserEntity } from "../user/UserEntity";

export type ConversationEntity = {
  id: string;
  name: string;
  avatar: string;
  users: UserEntity[];
  lastMessage: MessageEntity | null;
  totalMessage: number;
};
