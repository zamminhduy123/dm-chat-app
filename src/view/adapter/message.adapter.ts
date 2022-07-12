import { MessageController } from "../../controller";
import { MessageEntity } from "../../entities";
import { NewMessage } from "../../entities/type/NewMessage";
import { store } from "../../services/redux";

export function useMessage(): MessageEntity[] {
  return store.getState().message.messages;
}

export function getMessageFromConversation(): void {
  MessageController.getInstance().getMesssageFromConversation();
}
