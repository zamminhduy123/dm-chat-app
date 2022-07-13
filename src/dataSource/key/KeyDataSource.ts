import Fetcher from "../../api";
import { LocalStorage } from "../../storage";
import EncryptionKeyStorage from "../../storage/encryptionKey.storage";
import KeyHelper from "../../utils/keyHelper";

export interface IKeyDataSource {
  getSharedKey(identifier: string): Promise<string>;
}

export default class KeyDataSource implements IKeyDataSource {
  private _keyStorage: EncryptionKeyStorage;

  private _username: string;
  constructor() {
    this._keyStorage = new EncryptionKeyStorage();
    this._username = "";
  }

  setUsername(username: string) {
    this._username = username;
  }

  getMyPrivateKey(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const localStorage = await LocalStorage.getInstance().getLocalStorage();
        let myPrivateKey = localStorage.getItem(
          LocalStorage.getInstance().getPrivateKey()
        );
        let myNewKey;
        if (!myPrivateKey) {
          myNewKey = KeyHelper.getInstance().createKeyPair();
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

          //post public key to server
          await Fetcher.postUserPublicKey(this._username, newPublicKey);
        }
        resolve(myPrivateKey);
      } catch (err) {
        reject(err);
      }
    });
  }
  getSharedKey(identifier: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      //try get from local
      try {
        const key = await this._keyStorage.getSharedKey(identifier);
        if (key) {
          resolve(key);
        }

        //perform get key from server and calculate shared key
        const userPKey = await Fetcher.getUserPublicKey(identifier);

        const myPrivateKey = await this.getMyPrivateKey();

        const sharedKey = await KeyHelper.getInstance().calculateSharedKey(
          myPrivateKey,
          userPKey
        );
        // store to DB
        this._keyStorage.addSharedKey({
          identifier,
          key: sharedKey,
        });

        resolve(sharedKey);
      } catch (err) {
        reject(err);
      }
    });
  }
}
