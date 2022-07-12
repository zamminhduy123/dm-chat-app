import messageToKeywords from "../utils/messageToKeywords";
import db, { indexName, storeNames } from "./storageAdapter";

import {
  default as SearchDB,
  storeNames as searchStore,
} from "./storageAdapter/searchDB";
import { sMessageEntity } from "./storageEntity";
import { sKeywordMessageEntity } from "./storageEntity/sKeywordMessageEntity";
import { sPendingMesage } from "./storageEntity/sPendingMessage";
import { messageToKeywordMessage } from "./storageHelper";

interface IMessageStorage {
  getAllFromConversation: (
    conversation_id: string
  ) => Promise<sMessageEntity[]>;
  upsert: (newMessage: sMessageEntity[]) => Promise<any>;
  upsertPending: (newMessage: sPendingMesage[]) => Promise<any>;
  update: (updatedMessage: sMessageEntity[]) => Promise<any>;
  getAllPendingMessage: () => Promise<sPendingMesage[]>;
}
export default class MessageStorage implements IMessageStorage {
  getAllPendingMessage(): Promise<sPendingMesage[]> {
    return new Promise<sPendingMesage[]>(async (resolve, reject) => {
      try {
        const data = await db.getAll<sPendingMesage[]>(storeNames.pending);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  getLastMessageId(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const data = await db.getMany<sMessageEntity[]>(storeNames.message, 1);
        if (data && data[0] && data[0].id) resolve(data[0].id);
        else resolve("0");
      } catch (err) {
        reject(err);
      }
    });
  }
  get(messageId: string): Promise<sMessageEntity> {
    return new Promise<sMessageEntity>(async (resolve, reject) => {
      try {
        const data = await db.get<sMessageEntity>(
          storeNames.message,
          +messageId
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  getAllFromConversation(conversation_id: string): Promise<sMessageEntity[]> {
    return new Promise<sMessageEntity[]>(async (resolve, reject) => {
      try {
        const data = await db.getAllWithIndex<sMessageEntity[]>(
          storeNames.message,
          indexName.conversationId_sendTime,
          [conversation_id, 0],
          [conversation_id, new Date().getTime()]
        );
        // console.log("DATA", data);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  getFromConversation(
    conversation_id: string,
    from: number
  ): Promise<sMessageEntity[]> {
    return new Promise<sMessageEntity[]>(async (resolve, reject) => {
      try {
        const data = await db.getManyWithIndex<sMessageEntity[]>(
          storeNames.message,
          indexName.conversationId_sendTime,
          [conversation_id, 0],
          [conversation_id, from],
          "prev",
          true,
          15
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  upsertPending(newMessage: sPendingMesage[]) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const data = await db.upsert<sPendingMesage>(
          storeNames.pending,
          newMessage
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  upsert(newMessage: sMessageEntity[]) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const data = await db.upsert<sMessageEntity>(
          storeNames.message,
          newMessage
        );
        const deletePending: string[] = [];
        for (const msg of newMessage) {
          if (msg.clientMsgId) deletePending.push(msg.clientMsgId);
        }
        await db.delete(storeNames.pending, deletePending);

        //add to indexed DB
        await Promise.all(
          newMessage.map(async (msg) => {
            if (typeof msg.content !== "string") {
              return;
            }
            const kws = messageToKeywords(msg.content);
            // console.log(kws);
            await Promise.all(
              kws.map(async (kw) => {
                await SearchDB.tryUpsert(searchStore.keyword_message, [
                  messageToKeywordMessage(msg, kw),
                ]);
                // console.log(kw);
              })
            );
          })
        );

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  update(updatedMessage: sMessageEntity[]) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const data = await db.update<sMessageEntity>(
          storeNames.message,
          updatedMessage
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
