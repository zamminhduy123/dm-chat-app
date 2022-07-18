import { FileEntity } from "../../entities";

export type sMessageEntity = {
  id?: string;
  sender: string;
  type: number;
  status: number;
  content: string | FileEntity;
  clientMsgId?: string;
  conversation_id?: string;
  create_at?: number;
  to: string;
};
