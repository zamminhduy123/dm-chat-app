import Fetcher from "../../services/api";
import { Key } from "../../entities/type/Key";
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
    deviceKey: string,
    lastModified: number
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
  getUsername(): string {
    return this._username;
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
        if (!myPrivateKey) {
          console.log("CREATE NEW KEY");
          try {
            const newBundleKey = await this.createAndStoreNewKey();
            await this.sendPublicKeyToServer();
            myPrivateKey = newBundleKey.privateKey;
          } catch (err) {
            console.log(err);
            reject(err);
            return;
          }
        } else resolve(myPrivateKey);
      } catch (err) {
        reject(err);
      }
    });
  }

  getBundleKey(): Promise<Key> {
    return new Promise<Key>(async (resolve, reject) => {
      const localStorage = await LocalStorage.getInstance().getLocalStorage();

      const pubKey = localStorage.getItem(
        LocalStorage.getInstance().getPublicKey()
      );
      const devKey = localStorage.getItem(
        LocalStorage.getInstance().getDeviceKey()
      );
      const privKey = localStorage.getItem(
        LocalStorage.getInstance().getPrivateKey()
      );

      if (!privKey || !pubKey || !devKey) {
        try {
          const newBundleKey = await this.createAndStoreNewKey();
          resolve(newBundleKey);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve({
          privateKey: privKey,
          publicKey: pubKey,
          deviceKey: devKey,
        });
      }
    });
  }

  createAndStoreNewKey(): Promise<Key> {
    return new Promise<Key>(async (resolve, reject) => {
      eventEmitter.emit(userConstants.CREATE_NEW_KEY);
      let myNewKey;
      try {
        myNewKey = await KeyHelper.getInstance().createKeyPair(this._username);
      } catch (err) {
        console.error("ERROR CREATE NEW KEY");
        reject(err);
        return;
      }

      console.log("NEW KEY CREATED", myNewKey);
      const myPrivateKey = myNewKey.privateKey;
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
      resolve({
        privateKey: myPrivateKey,
        publicKey: newPublicKey,
        deviceKey: myNewKey.deviceKey,
      });
    });
  }

  sendPublicKeyToServer(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      if (!this._username) await this.awaitInit;

      try {
        const bundleKey = await this.getBundleKey();

        await Fetcher.postUserPublicKey(
          this._username,
          bundleKey.publicKey,
          bundleKey.deviceKey
        );
        resolve(true);
      } catch (err) {
        reject(err);
        return;
      }
    });
  }
  getSharedKey(identifier: string, deviceKey?: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      //try get from local
      try {
        let userPKey;
        console.log("GET KEY", identifier, "Device", deviceKey);
        userPKey = await this._keyStorage.getPublicKey(
          identifier,
          identifier === this._username ? undefined : deviceKey
        );
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
        userPKey = await Fetcher.getUserPublicKey(
          identifier,
          identifier === this._username ? undefined : deviceKey
        );
        console.log("FETCH KEYS", userPKey);
        const key = userPKey.key;
        if (!key) {
          throw new Error("No key found with given identifier" + identifier);
        }

        await this._keyStorage.addPublicKey({
          identifier,
          deviceKey: key.deviceKey,
          key: key.publicKey,
          lastModified: new Date(key.create_at).getTime(),
        });

        const sharedKey = await KeyHelper.getInstance().calculateSharedKey(
          myPrivateKey,
          key.publicKey
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
    deviceKey: string,
    lastModified: number
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
          lastModified,
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
