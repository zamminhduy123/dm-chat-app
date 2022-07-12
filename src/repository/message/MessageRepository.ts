import { IMessageDataSourceInterface } from "../../dataSource/message";
import { Message, MessageEntity } from "../../entities";
import { IMessageRepository } from "./IMessageRepository";
import * as Helper from "./helpers";
import MessageDataSource from "../../dataSource/message/MessageDataSource";

export default class MessageRepository implements IMessageRepository {
  messageDataSrc: IMessageDataSourceInterface;

  constructor(username: string) {
    this.messageDataSrc = new MessageDataSource(username);
  }
  getFileUrl(file: File, onProgress?: Function): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.messageDataSrc
        .getFileUrl(file, onProgress)
        .then(resolve)
        .catch(reject);
    });
  }
  resendPendingMessage(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.messageDataSrc.resendPendingMessage().then(resolve).catch(reject);
    });
  }

  updateMessage(updatedMessage: MessageEntity, key?: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.messageDataSrc
        .update(updatedMessage, key)
        .then(resolve)
        .catch(reject);
    });
  }

  addMessage(newMessage: MessageEntity): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.messageDataSrc.add(newMessage).then(resolve).catch(reject);
    });
  }
  getMessageByConversationId(
    conversation_id: string,
    from: number
  ): Promise<Message[]> {
    //get from storage
    return new Promise<Message[]>((resolve, reject) => {
      this.messageDataSrc
        .getByConversationId(conversation_id, from)
        .then((data) => {
          //console.log("DataSrc", data);
          resolve(Helper.standardMessageArray(data));
        })
        .catch(reject);
    });
  }
  syncMessage(conversation_id: string): Promise<any> {
    //get from storage
    return new Promise<any>((resolve, reject) => {
      this.messageDataSrc.sync(conversation_id).then(resolve).catch(reject);
    });
  }

  searchByKeyword(kw: string): Promise<Message[]> {
    //get from storage
    return new Promise<Message[]>((resolve, reject) => {
      this.messageDataSrc
        .searchByKeyword(kw)
        .then((data) => {
          //console.log("DataSrc", data);
          resolve(Helper.standardMessageArray(data));
        })
        .catch(reject);
    });
  }
}
