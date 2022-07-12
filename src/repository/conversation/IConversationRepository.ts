import { Conversation, ConversationEntity } from "../../entities";

export interface IConversationRepository {
  syncConversation(username: string): Promise<any>;
  getConversation(): Promise<Conversation[]>;
  addConversation(newConversation: ConversationEntity): Promise<any>;
  addGroupConversation(newConversation: ConversationEntity): Promise<any>;
  updateConversation(updatedConversation: ConversationEntity): Promise<any>;
}
