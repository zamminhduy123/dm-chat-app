import protobuf from "protobufjs";

class MessageProto {
  private ExtraMetaMessage: any;
  getExtraMeta() {
    return this.ExtraMetaMessage;
  }
  load() {
    return new Promise<any>((resolve, reject) => {
      protobuf.load("./message.json", (err: any, root: any) => {
        if (err && !root) reject(err);
        // Obtain a message type
        this.ExtraMetaMessage = root.lookupType(
          "messagepackage.ExtraMetaMessage"
        );
        resolve(1);
      });
    });
  }
}

const proto = new MessageProto();
export { proto };

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

  serialize() {
    var payload = { device_key: this._deviceKey, message: this._message };

    // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
    var errMsg = proto.getExtraMeta().verify(payload);
    // console.log("ERRR", errMsg);
    if (errMsg) throw Error(errMsg);

    // Create a new message
    var message = proto.getExtraMeta().create(payload); // or use .fromObject if conversion is necessary

    // Encode a message to an Uint8Array (browser) or Buffer (node)
    var buffer = proto.getExtraMeta().encode(message).finish();
    return Buffer.from(buffer).toString("base64");
  }

  deserialize(encodedMessage: string) {
    // Decode an Uint8Array (browser) or Buffer (node) to a message
    var message = proto
      .getExtraMeta()
      .decode(Buffer.from(encodedMessage, "base64"));

    // Maybe convert the message back to a plain object
    var object = proto.getExtraMeta().toObject(message);
    console.log("DESERIALIZE", object["device_key"], object["message"]);
    this.setDeviceKey(object["device_key"]);
    this.setMessage(object["message"]);
    return this;
  }
}
