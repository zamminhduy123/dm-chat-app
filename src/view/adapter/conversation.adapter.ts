import { ConversationController } from "../../controller";
import { ConversationEntity } from "../../entities";
import { store } from "../../services/redux";

export function initConversationController(): void {
  ConversationController.getInstance();
}
export function getConversationById(id: string): ConversationEntity {
  return store
    .getState()
    .conversation.conversations.find((el: ConversationEntity) => el.id == id);
}
