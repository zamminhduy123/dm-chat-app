import Fetcher from "../../api";
import { LocalStorage } from "../../storage";
import EncryptionKeyStorage from "../../storage/encryptionKey.storage";
import eventEmitter from "../../utils/event-emitter";
import KeyHelper, { arrayBufferToString } from "../../utils/keyHelper";
import { userConstants } from "../../view/action";

export interface IKeyDataSource {
  getSharedKey(identifier: string, deviceKey: string): Promise<string>;
  saveNewSharedKey(
    identifier: string,
    pubKey: string,
    deviceKey: string
  ): Promise<any>;
  getMyPrivateKey(): Promise<string>;
}

export default class KeyDataSource implements IKeyDataSource {
  private _keyStorage: EncryptionKeyStorage;

  private _username: string;
  private awaitInit: Promise<any>;
  private resolveInit: any;
  constructor() {
    this._keyStorage = new EncryptionKeyStorage();
    this._username = "";
    this.awaitInit = new Promise((res, rej) => {
      this.resolveInit = res;
    });
  }

  setUsername(username: string) {
    this._username = username;
    if (username) this.resolveInit();
    else
      this.awaitInit = new Promise((res, rej) => {
        this.resolveInit = res;
      });
  }

  private static _instance: KeyDataSource | null = null;
  public static getInstance() {
    if (!this._instance) this._instance = new KeyDataSource();
    return this._instance;
  }

  getMyPrivateKey(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (!this._username) await this.awaitInit;
      try {
        const localStorage = await LocalStorage.getInstance().getLocalStorage();
        let myPrivateKey = localStorage.getItem(
          LocalStorage.getInstance().getPrivateKey()
        );
        let myNewKey;
        if (!myPrivateKey) {
          console.log("CREATE NEW KEY");
          eventEmitter.emit(userConstants.CREATE_NEW_KEY);
          myNewKey = await KeyHelper.getInstance().createKeyPair(
            this._username
          );
          myPrivateKey = myNewKey.privateKey;
          const newPublicKey = myNewKey.publicKey;
          localStorage.setItem(
            LocalStorage.getInstance().getPrivateKey(),
            myPrivateKey
          );
          localStorage.setItem(
            LocalStorage.getInstance().getPublicKey(),
            newPublicKey
          );
          localStorage.setItem(
            LocalStorage.getInstance().getDeviceKey(),
            myNewKey.deviceKey
          );

          //post public key to server
          await Fetcher.postUserPublicKey(
            this._username,
            newPublicKey,
            myNewKey.deviceKey
          );
        }
        resolve(myPrivateKey);
      } catch (err) {
        reject(err);
      }
    });
  }
  getSharedKey(identifier: string, deviceKey?: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      //try get from local
      try {
        let userPKey;
        console.log("GET KEY", identifier, "Device", deviceKey);
        userPKey = await this._keyStorage.getPublicKey(identifier, deviceKey);
        // console.log("userPKey", userPKey);
        const myPrivateKey = await this.getMyPrivateKey();
        console.log("myPrivateKey", myPrivateKey);

        if (userPKey) {
          const sharedKey = await KeyHelper.getInstance().calculateSharedKey(
            myPrivateKey,
            userPKey
          );
          resolve(sharedKey);
          return;
        }

        //perform get key from server and calculate shared key
        userPKey = await Fetcher.getUserPublicKey(identifier, deviceKey);
        console.log("FETCH KEYS", userPKey);

        if (!userPKey.keys.length) {
          throw new Error("No key found with given identifier" + identifier);
        }
        for (const key of userPKey.keys) {
          // store to DB
          await this._keyStorage.addPublicKey({
            identifier,
            deviceKey: key.deviceKey,
            key: key.publicKey,
          });
        }
        const sharedKey = await KeyHelper.getInstance().calculateSharedKey(
          myPrivateKey,
          userPKey.keys[userPKey.keys.length - 1].publicKey
        );

        resolve(sharedKey);
      } catch (err) {
        reject(err);
      }
    });
  }
  saveNewSharedKey(
    identifier: string,
    pubKey: string,
    deviceKey: string
  ): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const myPrivateKey = await this.getMyPrivateKey();

        const sharedKey = await KeyHelper.getInstance().calculateSharedKey(
          myPrivateKey,
          pubKey
        );
        // store to DB
        await this._keyStorage.addPublicKey({
          identifier,
          deviceKey: deviceKey,
          key: pubKey,
        });

        resolve(sharedKey);
      } catch (err) {
        reject(err);
      }
    });
  }

  decryptMessage(
    identifier: string[],
    sender: string,
    message: string,
    deviceKey: string
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (!this._username) await this.awaitInit;

      try {
        const sharedKey = await this.getSharedKey(
          identifier.filter((id) => id !== this._username)[0],
          this._username !== sender ? deviceKey : undefined
        );
        if (sharedKey) {
          try {
            // console.log("DECRYPT", sharedKey, message, identifier);
            const decryptedMessage = await KeyHelper.getInstance().decrypt(
              sharedKey,
              message
            );
            resolve(decryptedMessage);
          } catch (err) {
            resolve("Could not decrypt message");
          }
        } else {
          resolve(message);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
