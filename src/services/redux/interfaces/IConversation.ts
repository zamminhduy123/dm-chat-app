import { ConversationEntity } from "../../../entities";

export interface IConversation {
  conversations: ConversationEntity[];
  selected: string;
  atMsgId: string;
}
