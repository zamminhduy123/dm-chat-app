import Fetcher from "../api";
import { cloneMessage } from "../controller/MessageController/helper";
import { FileEntity, MessageEnum, MessageStatus } from "../entities";
import KeyHelper from "../utils/keyHelper";
import messageToKeywords from "../utils/messageToKeywords";
import LocalStorage from "./localstorage/LocalStorage";
import db, { indexName, storeNames } from "./storageAdapter";

import {
  default as SearchDB,
  storeNames as searchStore,
} from "./storageAdapter/searchDB";
import { sMessageEntity } from "./storageEntity";
import { sKeywordMessageEntity } from "./storageEntity/sKeywordMessageEntity";
import { sPendingMesage } from "./storageEntity/sPendingMessage";
import { clonesMessageEntity, messageToKeywordMessage } from "./storageHelper";

interface IMessageStorage {
  getAllFromConversation: (
    conversation_id: string
  ) => Promise<sMessageEntity[]>;
  upsert: (newMessage: sMessageEntity[]) => Promise<any>;
  upsertPending: (newMessage: sPendingMesage[]) => Promise<any>;
  update: (updatedMessage: sMessageEntity[]) => Promise<any>;
  getAllPendingMessage: () => Promise<sPendingMesage[]>;
  delete: (id: string) => Promise<boolean>;
}
export default class MessageStorage implements IMessageStorage {
  private _localHashKey: string;
  constructor() {
    this._localHashKey = "";
    LocalStorage.getInstance()
      .getLocalStorage()
      .then((localStorage) => {
        const key = localStorage.getItem(
          LocalStorage.getInstance().getHashKey()
        );
        if (key) {
          this._localHashKey = key;
        } else {
          //TODO: fetch key
          Fetcher.getHashKey()
            .then((key) => (this._localHashKey = key))
            .catch((err) => console.error("Error fetching hashKey"));
        }
      });
  }
  delete(id: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        resolve(await db.delete(storeNames.message, [id]));
      } catch (err) {
        reject(err);
      }
    });
  }

  private async decryptLocalMessage(message: sMessageEntity) {
    //decrypt
    try {
      console.log("LOCAL KEY", this._localHashKey, message.content);
      if (typeof message.content === "string")
        message.content = await KeyHelper.getInstance().decrypt(
          this._localHashKey,
          message.content
        );
      else
        message.content.content = await KeyHelper.getInstance().decrypt(
          this._localHashKey,
          message.content.content
        );
    } catch (err) {
      console.log("LOCAL DECRYPT ERROR", err);
      message.status = MessageStatus.DECRYPT_FAIL;
    }
    return clonesMessageEntity(message);
  }
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
        let data = await db.get<sMessageEntity>(storeNames.message, +messageId);
        data = await this.decryptLocalMessage(data);
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
        await Promise.all(
          data.map(async (m) => {
            return await this.decryptLocalMessage(m);
          })
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  getFromConversation(
    conversation_id: string,
    from: number,
    to?: number
  ): Promise<sMessageEntity[]> {
    return new Promise<sMessageEntity[]>(async (resolve, reject) => {
      try {
        const data = await db.getManyWithIndex<sMessageEntity[]>(
          storeNames.message,
          indexName.conversationId_sendTime,
          [conversation_id, to ? to - 1 : 0],
          [conversation_id, from],
          "prev",
          true,
          to ? undefined : 15
        );

        // console.log("STORAGE MESSAGE 1 :", data, to);
        await Promise.all(
          data.map(async (m) => {
            // console.log(m.content);
            return await this.decryptLocalMessage(m);
          })
        );
        // console.log("STORAGE MESSAGE 2:", data, to);
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

  private async encryptLocalMessage(message: sMessageEntity) {
    if (typeof message.content === "string")
      message.content = await KeyHelper.getInstance().encrypt(
        this._localHashKey as string,
        message.content || "ERROR"
      );
    else
      message.content.content = await KeyHelper.getInstance().encrypt(
        this._localHashKey as string,
        message.content.content || "ERROR"
      );
    return clonesMessageEntity(message);
  }
  upsert(newMessage: sMessageEntity[]) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        //add to search db
        await Promise.all(
          newMessage.map(async (msg) => {
            if (
              typeof msg.content !== "string" ||
              +msg.status === MessageStatus.DECRYPT_FAIL ||
              +msg.status === MessageStatus.ERROR
            ) {
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
        //encrypt message
        await Promise.all(
          newMessage.map(async (msg) => {
            return await this.encryptLocalMessage(msg);
          })
        );
        //add to local db
        const data = await db.upsert<sMessageEntity>(
          storeNames.message,
          newMessage
        );
        const deletePending: string[] = [];
        for (const msg of newMessage) {
          if (msg.clientMsgId) deletePending.push(msg.clientMsgId);
        }
        await db.delete(storeNames.pending, deletePending);

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
  update(updatedMessage: sMessageEntity[]) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        //encrypt message
        await Promise.all(
          updatedMessage.map(async (msg) => {
            return await this.encryptLocalMessage(msg);
          })
        );

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
