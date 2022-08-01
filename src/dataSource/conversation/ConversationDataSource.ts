import { ConversationEntity, MessageEnum } from "../../entities";
import { ConversationStorage } from "../../storage";
import {
  conversationToStorageEntity,
  conversationStorageToEntity,
} from "../../storage/storageHelper";
import Fetcher from "../../services/api";
import KeyHelper, { arrayBufferToString } from "../../utils/keyHelper";
import KeyDataSource from "../key";
import MessageExtraMeta from "../../utils/MessageExtraMeta/MessageExtraMeta";
import E2EEGateWay from "../E2EEGateWay/E2EEGateWay";

export interface IConversationDataSource {
  get(): Promise<ConversationEntity[]>;
  add(newData: ConversationEntity): Promise<any>;
  update(updated: ConversationEntity): Promise<any>;
  delete(id: string): any;
  sync(username: string): Promise<any>;
}

export default class ConversationDataSource implements IConversationDataSource {
  private _convStorage: ConversationStorage;
  private _gateway: E2EEGateWay;
  constructor() {
    this._convStorage = new ConversationStorage();
    this._gateway = new E2EEGateWay();
  }
  sync(username: string): Promise<ConversationEntity[]> {
    return new Promise<ConversationEntity[]>(async (resolve, reject) => {
      //try fetch from server
      let serverData: ConversationEntity[];
      try {
        serverData = await Fetcher.getConversation(username);

        const mappedData: ConversationEntity[] = [];

        if (serverData) {
          for (const conver of serverData) {
            // const data = conversationToStorageEntity(conver);
            if (conver.lastMessage) {
              if (conver.lastMessage.type === MessageEnum.text)
                conver.lastMessage = await this._gateway.decryptMessage(
                  conver.lastMessage
                );
              else
                conver.lastMessage = JSON.parse(
                  conver.lastMessage.content as string
                );
              console.log("SYNC CONVER", conver.lastMessage);
            }
            const data = conversationToStorageEntity(conver);
            this._convStorage.update([data]);
            mappedData.push(conver);
          }
        }

        resolve(mappedData);
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
