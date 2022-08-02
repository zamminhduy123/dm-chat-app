import { MessageEntity, MessageEnum, MessageStatus } from "../../entities";
import Fetcher from "../../services/api";
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
import E2EEGateWay from "../E2EEGateWay/E2EEGateWay";
import eventEmitter from "../../utils/event-emitter";
import GateWay from "../E2EEGateWay/E2EEGateWay";

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

  private _messageIds;

  constructor(username: string) {
    this._msgStorage = new MessageStorage();
    this._conversationStorage = new ConversationStorage();
    this._searchStorage = new SearchStorage();
    this._username = username;
    this._messageIds = new Set<string>();

    Socket.getInstance().registerConnectSuccess(() =>
      this.init(this._msgStorage)
    );
    this.init(this._msgStorage);
  }

  init(storage: MessageStorage) {
    Socket.getInstance().removeRegisteredListener(
      messageConstants.RECEIVE_MESSAGE
    );
    Socket.getInstance().registerListener(
      messageConstants.RECEIVE_MESSAGE,
      async (message: MessageEntity) => {
        //decrypt receive message
        if (!(`${message.to}` === `g${message.conversation_id}`)) {
          message = await GateWay.receiveCheck(message);
        } else {
          message = GateWay.parseContent(message);
        }
        //emit to update UI
        eventEmitter.emit(messageConstants.RECEIVE_MESSAGE, message);
        //add to DB
        await storage.upsert([message]);
      }
    );
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

  sendSuccess() {}

  add(newData: MessageEntity) {
    console.log("ADD MESSAGE DS", newData);
    //get last message from storage

    return new Promise<any>(async (resolve, reject) => {
      try {
        console.log("message add ", newData);
        if (!newData.id) {
          try {
            //fresh message
            console.log("NEW MESSAGE", newData.to);
            if (newData.to !== `g${newData.conversation_id}`) {
              const encryptedMessage = await GateWay.encryptMessage(newData);
              await Socket.getInstance().emit(
                messageConstants.SEND_MESSAGE,
                encryptedMessage
              );
            } else {
              await Socket.getInstance().emit(
                messageConstants.SEND_MESSAGE,
                newData
              );
            }

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

          for (let message of data) {
            if (!(`${message.to}` === `g${message.conversation_id}`)) {
              message = await GateWay.receiveCheck(message);
            } else {
              message = GateWay.parseContent(message);
            }
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
        if (offset === 0) {
          this._messageIds.clear();
        }
        let newMessageIds: string[] = [];
        const kws = messageToKeywords(kw);
        await Promise.all(
          kws.map(async (kw, index) => {
            const data = await this._searchStorage.getDataByKeyword(kw, offset);
            if (index > 0) {
              data.forEach((d: sKeywordMessageEntity) => {
                if (!this._messageIds.has(d.msgId)) {
                  this._messageIds.delete(d.msgId);
                  newMessageIds = newMessageIds.filter((id) => id !== d.msgId);
                }
              });
            } else {
              data.forEach((d: sKeywordMessageEntity) => {
                if (!this._messageIds.has(d.msgId)) {
                  newMessageIds.push(d.msgId);
                }
                this._messageIds.add(d.msgId);
              });
            }
          })
        );

        await Promise.all(
          newMessageIds.map(async (id: string) => {
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
