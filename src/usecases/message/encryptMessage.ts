import { MessageEntity } from "../../entities";
import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";
import { LocalStorage } from "../../storage";
import KeyHelper, { arrayBufferToString } from "../../utils/keyHelper";
import MessageExtraMeta from "../../utils/MessageExtraMeta/MessageExtraMeta";

export interface EncryptMessageUseCase {
  execute: (message: MessageEntity) => void;
}

export class EncryptMessage implements EncryptMessageUseCase {
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(message: MessageEntity): Promise<MessageEntity> {
    return new Promise<MessageEntity>(async (resolve, reject) => {
      if (message.to) {
        let data = new MessageExtraMeta();
        //get message meta data
        const deviceKey = (
          await LocalStorage.getInstance().getLocalStorage()
        ).getItem(LocalStorage.getInstance().getDeviceKey());
        if (!deviceKey) {
          throw new Error("Lost device key");
        } else {
          data.setDeviceKey(deviceKey);
        }

        try {
          console.log("MESSAGE TO", message.to);
          const sharedKey = await this.msgRepo.getSharedKey(message.to);
          console.log("SHARE KEY", sharedKey);
          if (typeof message.content === "string") {
            message.content = await data
              .setMessage(
                await KeyHelper.getInstance().encrypt(
                  sharedKey,
                  message.content
                )
              )
              .serialize();
          } else {
            message.content.content = await data
              .setMessage(
                await KeyHelper.getInstance().encrypt(
                  sharedKey,
                  message.content.content
                )
              )
              .serialize();
          }
          console.log("TESTSTSTS", data.getDeviceKey());
          resolve(message);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(message);
      }
    });
  }
}
