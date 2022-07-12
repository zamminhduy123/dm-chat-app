import { FileEntity } from "../../entities";

export type sPendingMesage = {
  clientMsgId: string;
  sender: string;
  type: number;
  status: number;
  content: string | FileEntity;
  conversation_id?: string;
  to?: string[];
};
