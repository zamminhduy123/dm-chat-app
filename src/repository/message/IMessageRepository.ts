import { Message, MessageEntity } from "../../entities";

export interface IMessageRepository {
  getMessageByConversationId(
    conversation_id: string,
    from: number
  ): Promise<Message[]>;
  syncMessage(conversation_id: string): Promise<any>;
  addMessage(newMessage: MessageEntity): Promise<any>;
  updateMessage(updatedMessage: MessageEntity, key?: string): Promise<any>;
  resendPendingMessage(): Promise<any>;
  getFileUrl(file: File, onProgress?: Function): Promise<string>;
  searchByKeyword(kw: string): Promise<Message[]>;
}
