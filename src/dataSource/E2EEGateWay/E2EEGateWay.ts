import { MessageEntity, MessageEnum, MessageStatus } from "../../entities";
import { LocalStorage } from "../../storage";
import KeyHelper from "../../utils/keyHelper";
import MessageExtraMeta from "../../utils/MessageExtraMeta/MessageExtraMeta";
import KeyDataSource from "../key";

class E2EEGateWay {
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

  parseContent = (message: MessageEntity) => {
    if (message) {
      if (+message.type !== MessageEnum.text) {
        if (typeof message.content === "string")
          message.content = JSON.parse(message.content);
      }
      message.create_at = new Date(message.create_at).getTime();
    }
    return message;
  };

  async receiveCheck(message: MessageEntity) {
    return new Promise<MessageEntity>(async (resolve, reject) => {
      //STEP 1: parse content
      message = this.parseContent(message);

      //STEP 2: decrypt message
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

  encryptMessage(message: MessageEntity) {
    return new Promise<MessageEntity>(async (resolve, reject) => {
      if (message.to) {
        let data = new MessageExtraMeta();
        //get message meta data
        const deviceKey = (
          await LocalStorage.getInstance().getLocalStorage()
        ).getItem(LocalStorage.getInstance().getDeviceKey());
        if (!deviceKey) {
          reject("Lost device key");
        } else {
          data.setDeviceKey(deviceKey);
        }

        try {
          console.log("MESSAGE TO", message.to);
          const sharedKey = await KeyDataSource.getInstance().getSharedKey(
            message.to
          );
          console.log("SHARE KEY", sharedKey);
          if (typeof message.content === "string") {
            message.content = data
              .setMessage(
                await KeyHelper.getInstance().encrypt(
                  sharedKey,
                  message.content
                )
              )
              .serialize();
          } else {
            message.content.content = data
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

const GateWay = new E2EEGateWay();
export default GateWay;
