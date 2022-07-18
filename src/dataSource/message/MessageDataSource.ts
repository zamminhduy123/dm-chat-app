import { MessageEntity, MessageEnum } from "../../entities";
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

export interface IMessageDataSourceInterface {
  getByConversationId(
    conversationId: string,
    from: number,
    to?: number
  ): Promise<MessageEntity[]>;
  add(newData: MessageEntity): Promise<any>;
  update(updated: MessageEntity, key?: string): Promise<any>;
  delete(id: string): any;
  sync(conversationId: string): Promise<any>;
  resendPendingMessage(): Promise<any>;
  getFileUrl(file: File, onProgress?: Function): Promise<string>;
  searchByKeyword(kw: string): Promise<MessageEntity[]>;
}

export default class MessageDataSource implements IMessageDataSourceInterface {
  private _msgStorage: MessageStorage;
  private _searchStorage: SearchStorage;
  private _conversationStorage: ConversationStorage;

  constructor(username: string) {
    this._msgStorage = new MessageStorage();
    this._conversationStorage = new ConversationStorage();
    this._searchStorage = new SearchStorage();
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
        // console.log("message add ", newData);
        if (!newData.id) {
          //fresh message
          Socket.getInstance().emit(messageConstants.SEND_MESSAGE, newData);
          await this._msgStorage.upsertPending([
            messageEntityToPendingStorage(newData),
          ]);
        } else {
          const sMessage = messageEntityToStorage(newData);
          await this._msgStorage.upsert([sMessage]);
        }
        resolve(1);
      } catch (err) {
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
        const sMessage = messageEntityToStorage(updated);
        await this._msgStorage.update([sMessage]);
        resolve(1);
      } catch (err) {
        reject(err);
      }
    });
  }
  delete(id: string) {
    throw new Error("Method not implemented.");
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
              if (+message.type === MessageEnum.text) {
                await messageExtra.deserialize(message.content);
              } else {
                console.log("MESSAGE", message.content);
                message.content = JSON.parse(message.content);
                console.log("MESSAGE", message.content.content);
                await messageExtra.deserialize(message.content.content);
              }
              console.log(
                "MESSAGE EXTRA",
                messageExtra.getDeviceKey(),
                messageExtra.getMessage()
              );
              try {
                const conversation = await this._conversationStorage.get(
                  message.conversation_id
                );
                let decryptedMessage = "Could not decrypt message";
                try {
                  decryptedMessage =
                    await KeyDataSource.getInstance().decryptMessage(
                      conversation.users.map((u) => u.username),
                      message.sender,
                      messageExtra.getMessage(),
                      messageExtra.getDeviceKey()
                    );
                } catch (err) {
                  console.log("DECRYPT ERR", err);
                }
                if (typeof message.content === "string") {
                  message.content = decryptedMessage;
                } else {
                  message.content.content = decryptedMessage;
                }
              } catch (err) {}
              console.log(dbData);
            }
            dbData.push(messageEntityToStorage(message));
          }
          try {
            await this._msgStorage.upsert(dbData);
            //announce to server that client receive the mesage
            data.forEach((msg: any) => {
              Socket.getInstance().emit<MessageEntity>(
                messageConstants.NEW_MESSAGE_RECEIVED,
                msg
              );
            });
            resolve(true);
          } catch (err) {
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
          resolve(data.map((el) => messageStorageToEntity(el)));
        })
        .catch(reject);
    });
  };

  searchByKeyword = (kw: string): Promise<MessageEntity[]> => {
    return new Promise<MessageEntity[]>(async (resolve, reject) => {
      try {
        let result: MessageEntity[] = [];

        let messageIds = new Set<string>();

        const kws = messageToKeywords(kw);
        await Promise.all(
          kws.map(async (kw) => {
            const data = await this._searchStorage.getDataByKeyword(kw);
            data.forEach((d) => messageIds.add(d.msgId));
          })
        );
        console.log(messageIds);

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
