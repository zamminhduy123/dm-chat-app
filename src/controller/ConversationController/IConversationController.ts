import { ConversationEntity } from "../../entities";

export interface IConversationController {
  getConversations(): void;
  addNewConversation(conversation: ConversationEntity): void;
}
