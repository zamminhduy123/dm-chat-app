import { MessageEntity } from "../../entities";

export interface IMessageController {
  syncMessage: () => void;
  getMesssageFromConversation: (from: number) => void;
}
