import protobuf from "protobufjs";

export default class MessageExtraMeta {
  private _deviceKey: string;
  private _message: string;

  constructor() {
    this._deviceKey = "";
    this._message = "";
  }

  getDeviceKey() {
    return this._deviceKey;
  }
  getMessage() {
    return this._message;
  }

  setDeviceKey(deviceKey: string) {
    this._deviceKey = deviceKey;
    return this;
  }
  setMessage(message: string) {
    this._message = message;
    return this;
  }

  async serialize() {
    return new Promise<string>((resolve, reject) => {
      protobuf.load("./message.json", (err: any, root: any) => {
        if (err && !root) reject(err);

        // console.log(root);

        // Obtain a message type
        var ExtraMetaMessage = root.lookupType(
          "messagepackage.ExtraMetaMessage"
        );

        // Exemplary payload
        var payload = { device_key: this._deviceKey, message: this._message };

        // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
        var errMsg = ExtraMetaMessage.verify(payload);
        // console.log("ERRR", errMsg);
        if (errMsg) throw Error(errMsg);

        // Create a new message
        var message = ExtraMetaMessage.create(payload); // or use .fromObject if conversion is necessary

        // Encode a message to an Uint8Array (browser) or Buffer (node)
        var buffer = ExtraMetaMessage.encode(message).finish();
        resolve(Buffer.from(buffer).toString("base64"));
      });
    });
  }

  async deserialize(encodedMessage: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      protobuf.load("message.json", (err, root) => {
        if (err) reject(err);

        // Obtain a message type
        var ExtraMetaMessage = root!.lookupType(
          "messagepackage.ExtraMetaMessage"
        );

        // Decode an Uint8Array (browser) or Buffer (node) to a message
        var message = ExtraMetaMessage.decode(
          Buffer.from(encodedMessage, "base64")
        );

        // Maybe convert the message back to a plain object
        var object = ExtraMetaMessage.toObject(message);
        console.log("DESERIALIZE", object["device_key"], object["message"]);
        this.setDeviceKey(object["device_key"]);
        this.setMessage(object["message"]);
        resolve(this);
      });
    });
  }
}
