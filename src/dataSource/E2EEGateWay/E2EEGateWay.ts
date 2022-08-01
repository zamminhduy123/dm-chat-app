import { MessageEntity, MessageStatus } from "../../entities";
import KeyHelper from "../../utils/keyHelper";
import MessageExtraMeta from "../../utils/MessageExtraMeta/MessageExtraMeta";
import KeyDataSource from "../key";

export default class E2EEGateWay {
  private _cacheSharedKey: any = {};
  constructor() {}

  private async getSharedKey(identifier: string, deviceKey: string) {
    if (this._cacheSharedKey[deviceKey]) {
      return this._cacheSharedKey[deviceKey];
    } else {
      let sharedKey = "";

      try {
        sharedKey = await KeyDataSource.getInstance().getSharedKey(
          identifier,
          deviceKey
        );
        this._cacheSharedKey[deviceKey] = sharedKey;
        this._cacheSharedKey[identifier] = sharedKey;
      } catch (err) {
        console.error("Error Getting Shared Key", err);
        return "";
      }

      return sharedKey;
    }
  }

  async decryptMessage(message: MessageEntity) {
    return new Promise<MessageEntity>(async (resolve, reject) => {
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
        let sharedKey = await this.getSharedKey(
          message.sender === KeyDataSource.getInstance().getUsername()
            ? message.to
            : message.sender,
          messageExtra.getDeviceKey()
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
        console.error(err);
        messageContent = "Could not decrypt message";
      }
      if (messageContent)
        if (typeof message.content === "string") {
          message.content = messageContent;
        } else {
          message.content.content = messageContent;
        }
      resolve(message);
    });
  }

  encryptMessage(message: MessageEntity) {}
}
