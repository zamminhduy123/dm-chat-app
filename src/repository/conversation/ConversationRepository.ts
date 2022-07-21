import ConversationDataSource from "../../dataSource/conversation/ConversationDataSource";
import { Conversation, ConversationEntity } from "../../entities";
import { IConversationRepository } from "./IConversationRepository";
import * as Helper from "./helpers";

export default class ConversationRepository implements IConversationRepository {
  conversationDataSrc: ConversationDataSource;

  constructor() {
    this.conversationDataSrc = new ConversationDataSource();
  }

  updateConversation(updatedConversation: ConversationEntity): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.conversationDataSrc
        .update(updatedConversation)
        .then(resolve)
        .catch(reject);
    });
  }
  syncConversation(username: string): Promise<Conversation[]> {
    return new Promise<any>((resolve, reject) => {
      this.conversationDataSrc
        .sync(username)
        .then((data) => {
          resolve(Helper.standardConversationArray(data));
        })
        .catch(reject);
    });
  }
  addConversation(newConversation: ConversationEntity): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.conversationDataSrc.add(newConversation).then(resolve).catch(reject);
    });
  }
  addGroupConversation(newConversation: ConversationEntity): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.conversationDataSrc
        .addGroup(newConversation)
        .then(resolve)
        .catch(reject);
    });
  }
  getConversation(): Promise<Conversation[]> {
    //get from storage
    return new Promise<Conversation[]>((resolve, reject) => {
      this.conversationDataSrc
        .get()
        .then((data) => {
          resolve(Helper.standardConversationArray(data));
        })
        .catch(reject);
    });
  }
}
