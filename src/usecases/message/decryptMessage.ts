import { Message, MessageEntity, MessageStatus } from "../../entities";
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
      console.log()
      if (message.to) {
        let messageExtra = new MessageExtraMeta();
        //get message meta data
        let messageContent: string;
        if (typeof message.content === "string") {
          messageContent = message.content;
        } else {
          messageContent = message.content.content;
        }
        try {
          messageExtra.deserialize(messageContent);

          const sharedKey = await this.msgRepo.getSharedKey(
            message.to === username ? message.sender : message.to,
            message.to === username
              ? messageExtra.getDeviceKey()
              : undefined
          );
          try {
            messageContent = await KeyHelper.getInstance().decrypt(
              sharedKey,
              messageExtra.getMessage()
            );
          } catch (err) {
            console.log("DECRYPT ERR", err);
            message.status = MessageStatus.DECRYPT_FAIL;
          }
        } catch (err) {
          messageContent = "Could not decrypt message";
        }
        if (messageContent)
          if (typeof message.content === "string") {
            message.content = messageContent;
          } else {
            message.content.content = messageContent;
          }
        resolve(message);
      } else {
        resolve(message);
      }
    });
  }
}
