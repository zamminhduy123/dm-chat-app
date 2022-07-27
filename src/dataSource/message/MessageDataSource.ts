import { MessageEntity, MessageEnum, MessageStatus } from "../../entities";
import Fetcher from "../../api";
import {
  ConversationStorage,
  messageEntityToPendingStorage,
  messageEntityToStorage,
  MessageStorage,
  messageStorageToEntity,
  pendingMessageStorageToEntity,
} from "../../storage";
import { Socket } from "../../services/socket";
import { messageConstants } from "../../view/action";
import { LocalStorage } from "../../storage";
import { mapMessageStatus, mapTypeMessage } from "../../utils/utils";
import SearchStorage from "../../storage/search.storage";
import { sMessageEntity } from "../../storage/storageEntity";
import messageToKeywords from "../../utils/messageToKeywords";
import KeyDataSource from "../key";
import MessageExtraMeta from "../../utils/MessageExtraMeta/MessageExtraMeta";
import KeyHelper, { arrayBufferToString } from "../../utils/keyHelper";
import { sKeywordMessageEntity } from "../../storage/storageEntity/sKeywordMessageEntity";

export interface IMessageDataSourceInterface {
  getByConversationId(
    conversationId: string,
    from: number,
    to?: number
  ): Promise<MessageEntity[]>;
  add(newData: MessageEntity): Promise<any>;
  update(updated: MessageEntity, key?: string): Promise<any>;
  delete(id: string): any;
  sync(): Promise<any>;
  resendPendingMessage(): Promise<any>;
  getFileUrl(file: File, onProgress?: Function): Promise<string>;
  searchByKeyword(kw: string, offset: number): Promise<MessageEntity[]>;
}

export default class MessageDataSource implements IMessageDataSourceInterface {
  private _msgStorage: MessageStorage;
  private _searchStorage: SearchStorage;
  private _conversationStorage: ConversationStorage;
  private _username: string;

  constructor(username: string) {
    this._msgStorage = new MessageStorage();
    this._conversationStorage = new ConversationStorage();
    this._searchStorage = new SearchStorage();
    this._username = username;
  }
  resendPendingMessage(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      //get all pending message from DB
      try {
        const data = await this._msgStorage.getAllPendingMessage();
        console.log("RESEND ", data);
        if (data) {
          data.map((msg) => {
            //fresh message
            Socket.getInstance().emit(messageConstants.SEND_MESSAGE, msg);
          });
        }
        resolve(1);
      } catch (err) {
        reject(err);
      }
    });
  }
  add(newData: MessageEntity) {
    console.log("ADD MESSAGE DS", newData);
    //get last message from storage
    return new Promise<any>(async (resolve, reject) => {
      try {
        console.log("message add ", newData);
        if (!newData.id) {
          try {
            //fresh message
            await Socket.getInstance().emit(
              messageConstants.SEND_MESSAGE,
              newData
            );
            await this._msgStorage.upsertPending([
              messageEntityToPendingStorage(newData),
            ]);
          } catch (err) {
            console.log("ERRRRRR", err);
            reject(err);
          }
        } else {
          if (
            newData.id === newData.clientId &&
            newData.status === MessageStatus.SENDING
          ) {
            //resend error message
            await this._msgStorage.delete(newData.id);
            await Socket.getInstance().emit(
              messageConstants.SEND_MESSAGE,
              newData
            );
          } else {
            //message send successfully
            const sMessage = messageEntityToStorage(newData);
            await this._msgStorage.upsert([sMessage]);
          }
        }
        resolve(1);
      } catch (err) {
        console.log("ERRRRRR", err);
        reject(err);
      }
    });
  }
  getFileUrl(file: File, onProgress?: Function): Promise<string> {
    //get last message from storage
    return new Promise<string>(async (resolve, reject) => {
      try {
        const url = await Fetcher.sendFile(file, onProgress);
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });
  }
  update(updated: MessageEntity, key?: string): Promise<any> {
    //get last message from storage
    return new Promise<any>(async (resolve, reject) => {
      try {
        const storageMessage = await this._msgStorage.get(updated.id!);
        storageMessage.status = updated.status;
        await this._msgStorage.update([storageMessage]);
        resolve(1);
      } catch (err) {
        reject(err);
      }
    });
  }
  delete(id: string) {
    //get last message from storage
    return new Promise<any>(async (resolve, reject) => {
      try {
        resolve(await this._msgStorage.delete(id));
      } catch (err) {
        reject(err);
      }
    });
  }

  sync(): Promise<any> {
    //get last message from storage
    return new Promise<any>(async (resolve, reject) => {
      let lastMessageId = await this._msgStorage.getLastMessageId();
      console.log("LAST_ID", lastMessageId);
      Fetcher.getNewMessage(lastMessageId)
        .then(async (data) => {
          //update to db
          console.log("fetch with last message id", data);

          const dbData = [];

          for (const message of data) {
            let messageExtra = new MessageExtraMeta();
            //get message meta data
            if (!(`${message.to}` === `g${message.conversation_id}`)) {
              let messageContent = "";
              try {
                if (+message.type === MessageEnum.text) {
                  messageContent = message.content;
                } else {
                  message.content = JSON.parse(message.content);
                  messageContent = message.content.content;
                }

                let decryptedMessage;
                try {
                  messageExtra.deserialize(messageContent || "");
                  console.log("MESSAGE DS", this._username);
                  const sharedKey =
                    await KeyDataSource.getInstance().getSharedKey(
                      message.to === this._username
                        ? message.sender
                        : message.to,
                      message.to === this._username
                        ? messageExtra.getDeviceKey()
                        : undefined
                    );
                  console.log("SHAREKEY", sharedKey);
                  decryptedMessage = await KeyHelper.getInstance().decrypt(
                    sharedKey,
                    messageExtra.getMessage()
                  );
                  console.log("DECRYPT", decryptedMessage, message.id);
                } catch (err) {
                  console.log("DECRYPT ERR", err);
                  message.status = MessageStatus.DECRYPT_FAIL;
                }
                if (decryptedMessage)
                  if (typeof message.content === "string") {
                    message.content = decryptedMessage;
                  } else {
                    message.content.content = decryptedMessage;
                  }
              } catch (err) {
                console.log("Sync message error", err);
              }
            } else {
              if (+message.type !== MessageEnum.text) {
                message.content = JSON.parse(message.content);
              }
            }
            console.log("FUCK MESSAGE", message);
            dbData.push(messageEntityToStorage(message));
          }
          try {
            console.log("DBDATA:", dbData);
            await this._msgStorage.upsert(dbData);
            //announce to server that client receive the mesage
            data.forEach((msg: any) => {
              Socket.getInstance().emit<MessageEntity>(
                messageConstants.NEW_MESSAGE_RECEIVED,
                msg
              );
            });
            resolve(dbData.length);
          } catch (err) {
            console.error(err);
            reject(err);
          }
        })
        .catch((err) => reject(err));
    });
  }

  getByConversationId = async (
    conversationId: string,
    from: number,
    to?: number
  ): Promise<MessageEntity[]> => {
    return new Promise<MessageEntity[]>((resolve, reject) => {
      this._msgStorage
        .getFromConversation(conversationId, from, to)
        .then((data) => {
          console.log("DADADADADA", data);
          resolve(data.map((el) => messageStorageToEntity(el)));
        })
        .catch(reject);
    });
  };

  searchByKeyword = (kw: string, offset: number): Promise<MessageEntity[]> => {
    return new Promise<MessageEntity[]>(async (resolve, reject) => {
      try {
        let result: MessageEntity[] = [];

        let messageIds = new Set<string>();

        const kws = messageToKeywords(kw);
        await Promise.all(
          kws.map(async (kw, index) => {
            const data = await this._searchStorage.getDataByKeyword(kw, offset);
            if (index > 0) {
              data.forEach((d: sKeywordMessageEntity) => {
                if (!messageIds.has(d.msgId)) {
                  messageIds.delete(d.msgId);
                }
              });
            } else {
              data.forEach((d: sKeywordMessageEntity) =>
                messageIds.add(d.msgId)
              );
            }
          })
        );

        await Promise.all(
          Array.from(messageIds).map(async (id: string) => {
            try {
              const message = await this._msgStorage.get(id);
              result.push(messageStorageToEntity(message));
            } catch (err) {
              console.log("ERR SEARCHING IMAGE", err);
            }
          })
        );

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  };
}
