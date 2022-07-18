import { ConversationEntity, MessageEntity } from "../../../entities";

export interface IConversation {
  conversations: ConversationEntity[];
  selected: string;
  atMsg: MessageEntity | null;
}
