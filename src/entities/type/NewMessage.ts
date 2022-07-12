import { FileEntity, MessageEnum } from "../message";

export type NewMessage = {
  sender: string;
  type: MessageEnum;
  content: string | FileEntity;
  conversation_id: string | null;
  clientID: string;
};
