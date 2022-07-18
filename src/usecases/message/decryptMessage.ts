import { MessageEntity } from "../../entities";
import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";
import KeyHelper, { arrayBufferToString } from "../../utils/keyHelper";
import MessageExtraMeta from "../../utils/MessageExtraMeta/MessageExtraMeta";

export interface DecryptMessageUseCase {
  execute: (message: MessageEntity, username: string) => void;
}

export class DecryptMessage implements DecryptMessageUseCase {
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(
    message: MessageEntity,
    username: string
  ): Promise<MessageEntity> {
    return new Promise<MessageEntity>(async (resolve, reject) => {
      if (message.to) {
        let messageExtra = new MessageExtraMeta();
        //get message meta data
        if (typeof message.content === "string") {
          await messageExtra.deserialize(message.content);
        } else {
          await messageExtra.deserialize(message.content.content);
        }

        try {
          const sharedKey = await this.msgRepo.getSharedKey(
            message.sender === username ? message.to : message.sender,
            message.sender === username
              ? undefined
              : messageExtra.getDeviceKey()
          );
          if (typeof message.content === "string") {
            try {
              message.content = await KeyHelper.getInstance().decrypt(
                sharedKey,
                messageExtra.getMessage()
              );
            } catch (err) {
              console.log("DECRYPT ERR", err);
              message.content = "Could not decrypt message";
            }
          } else {
            try {
              message.content.content = await KeyHelper.getInstance().decrypt(
                sharedKey,
                messageExtra.getMessage()
              );
            } catch (err) {
              console.log("DECRYPT ERR", err);
              message.content.content = "Could not decrypt message";
            }
          }
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
