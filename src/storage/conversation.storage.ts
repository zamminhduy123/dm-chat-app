import db, { indexName, storeNames } from "./storageAdapter";
import { sConversationEntity } from "./storageEntity";

interface IConversationStorage {
  getMany: () => Promise<sConversationEntity[]>;
  upsert: (newConversation: sConversationEntity) => Promise<any>;
  update: (updatedConversation: sConversationEntity[]) => Promise<any>;
  get: (conversationId: string) => Promise<sConversationEntity | undefined>;
}
export default class ConversationStorage implements IConversationStorage {
  get(conversationId: string): Promise<sConversationEntity | undefined> {
    return new Promise<sConversationEntity | undefined>(
      async (resolve, reject) => {
        try {
          const data = await db.get<sConversationEntity | undefined>(
            storeNames.conversation,
            conversationId
          );
          resolve(data);
        } catch (err) {
          reject(err);
        }
      }
    );
  }
  upsert(newConversation: sConversationEntity) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const data = await db.upsert<sConversationEntity>(
          storeNames.conversation,
          [newConversation]
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  update(updatedConversation: sConversationEntity[]) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const data = await db.update<sConversationEntity>(
          storeNames.conversation,
          updatedConversation
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  getMany(): Promise<sConversationEntity[]> {
    return new Promise<sConversationEntity[]>(async (resolve, reject) => {
      try {
        const data = await db.getManyWithIndex<sConversationEntity[]>(
          storeNames.conversation,
          indexName.lastMessageTime,
          [new Date(`1970`).getTime()],
          [new Date().getTime()],
          "prev"
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
