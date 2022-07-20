import { ConversationEntity, MessageEnum } from "../../entities";
import { ConversationStorage } from "../../storage";
import {
  conversationToStorageEntity,
  conversationStorageToEntity,
} from "../../storage/storageHelper";
import Fetcher from "../../api";
import KeyHelper, { arrayBufferToString } from "../../utils/keyHelper";
import KeyDataSource from "../key";
import MessageExtraMeta from "../../utils/MessageExtraMeta/MessageExtraMeta";

export interface IConversationDataSource {
  get(): Promise<ConversationEntity[]>;
  add(newData: ConversationEntity): Promise<any>;
  update(updated: ConversationEntity): Promise<any>;
  delete(id: string): any;
  sync(username: string): Promise<any>;
}

export default class ConversationDataSource implements IConversationDataSource {
  private _convStorage: ConversationStorage;
  constructor() {
    this._convStorage = new ConversationStorage();
  }
  sync(username: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      //try fetch from server
      let serverData: ConversationEntity[];
      try {
        serverData = await Fetcher.getConversation(username);

        if (serverData) {
          for (const conver of serverData) {
            const data = conversationToStorageEntity(conver);
            const currentData = await this._convStorage.get(data.id);
            if (
              !currentData ||
              currentData.lastMessageId !== data.lastMessageId
            ) {
              //try decrypt
              if (conver.users.length === 2 && conver.lastMessage) {
                if (+conver.lastMessage.type === MessageEnum.text) {
                  try {
                    let messageExtra = new MessageExtraMeta().deserialize(
                      conver.lastMessage.content as string
                    );
                    const sharedKey =
                      await KeyDataSource.getInstance().getSharedKey(
                        conver.users.filter((u) => u.username !== username)[0]
                          .username,
                        conver.lastMessage.sender !== username
                          ? messageExtra.getDeviceKey()
                          : undefined
                      );
                    data.lastMessageContent =
                      await KeyHelper.getInstance().decrypt(
                        sharedKey,
                        messageExtra.getMessage()
                      );
                  } catch (err) {
                    data.lastMessageContent = "Could not decrypt message";
                    console.log("SYNC CONVERSATION ERR", err);
                  }
                }
              }
              await this._convStorage.update([data]);
            }
          }
        }

        resolve(true);
      } catch (err) {
        console.log("Server fetch error", err);
        reject(err);
      }
    });
  }
  add(newData: ConversationEntity): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        resolve(
          await this._convStorage.upsert(conversationToStorageEntity(newData))
        );
      } catch (err) {
        reject(err);
      }
    });
  }
  addGroup(newData: ConversationEntity): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const newGroupConversation = await Fetcher.createConversation(newData);
        await this._convStorage.upsert(
          conversationToStorageEntity(newGroupConversation)
        );
        resolve(newGroupConversation);
      } catch (err) {
        reject(err);
      }
    });
  }
  update(updatedData: ConversationEntity): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        resolve(
          await this._convStorage.update([
            conversationToStorageEntity(updatedData),
          ])
        );
      } catch (err) {
        reject(err);
      }
    });
  }
  delete(id: string) {
    throw new Error("Method not implemented.");
  }

  get = async (): Promise<ConversationEntity[]> => {
    return new Promise<ConversationEntity[]>(async (resolve, reject) => {
      this._convStorage
        .getMany()
        .then(async (data) => {
          // console.log(data);
          if (data) {
            resolve(data.map((el) => conversationStorageToEntity(el)));
          } else {
            resolve([]);
          }
        })
        .catch((err) => reject(err));
    });
  };
}
