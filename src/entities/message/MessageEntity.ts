export enum MessageEnum {
  text = 0,
  image = 1,
  video = 2,
  file = 3,
}

export enum MessageStatus {
  SENDING = 0,
  SENT = 1,
  RECEIVED = 2,
  SEEN = 3,
  ERROR = 4,
  DECRYPT_FAIL = 5,
}

export type FileEntity = {
  content: string;
  name: string;
  size: number;
  type: string;
};

export type MessageEntity = {
  id?: string;
  sender: string;
  type: MessageEnum;
  content: string | FileEntity;
  create_at: number;
  clientId?: string;
  to: string;
  conversation_id?: string;
  status: MessageStatus;
};
