import { ConversationEntity, MessageEnum } from "../../entities";
import { ConversationStorage } from "../../storage";
import {
  conversationToStorageEntity,
  conversationStorageToEntity,
} from "../../storage/storageHelper";
import Fetcher from "../../services/api";
import E2EEGateWay from "../E2EEGateWay/E2EEGateWay";
import { Socket } from "../../services/socket";
import { conversationConstants } from "../../view/action";
import eventEmitter from "../../utils/event-emitter";
import GateWay from "../E2EEGateWay/E2EEGateWay";
import { sConversationEntity } from "../../storage/storageEntity";

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

    Socket.getInstance().registerConnectSuccess(() =>
      this.init(this._convStorage)
    );
    this.init(this._convStorage);
  }

  init(storage: ConversationStorage) {
    Socket.getInstance().removeRegisteredListener(
      conversationConstants.CONVERSATION_CHANGE
    );
    Socket.getInstance().registerListener(
      conversationConstants.CONVERSATION_CHANGE,
      async (conversation: ConversationEntity) => {
        if (conversation.lastMessage) {
          if (conversation.lastMessage.to !== `g${conversation.id}`) {
            //decrypt receive message
            conversation.lastMessage = await GateWay.receiveCheck(
              conversation.lastMessage
            );
          } else {
            //decrypt receive message
            conversation.lastMessage = GateWay.parseContent(
              conversation.lastMessage
            );
          }
        }

        console.log("HIHIHIHI", conversation);

        //emit to update UI
        eventEmitter.emit(
          conversationConstants.CONVERSATION_CHANGE,
          conversation
        );

        //add to DB
        console.log(
          "UPDATE",
          await storage.update([conversationToStorageEntity(conversation)])
        );
      }
    );
  }
  sync(username: string): Promise<ConversationEntity[]> {
    return new Promise<ConversationEntity[]>(async (resolve, reject) => {
      //try fetch from server
      let serverData: ConversationEntity[];
      try {
        serverData = await Fetcher.getConversation(username);

        const mappedData: ConversationEntity[] = [];
        const storageData: sConversationEntity[] = [];

        if (serverData) {
          for (const conver of serverData) {
            // const data = conversationToStorageEntity(conver);
            console.log("CONVERSATION", conver);
            if (conver.lastMessage) {
              if (conver.lastMessage.to !== `g${conver.id}`)
                conver.lastMessage = await GateWay.receiveCheck(
                  conver.lastMessage
                );
              else
                conver.lastMessage = GateWay.parseContent(conver.lastMessage);
            }
            const data = conversationToStorageEntity(conver);

            storageData.push(data);
            mappedData.push(conver);
          }
        }
        this._convStorage.update(storageData);
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
        console.log("CONVDS", updatedData);
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
          console.log("GET", data);
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
