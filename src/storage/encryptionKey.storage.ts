import db, { indexName, storeNames } from "./storageAdapter";
import { sConversationEntity } from "./storageEntity";
import { sKey } from "./storageEntity/sKey";
import { sSharedKey } from "./storageEntity/sShareKey";

interface IEncryptionKeyStorage {
  getSharedKey(identifier: string): Promise<string>;
  addSharedKey(key: sSharedKey): Promise<any>;
}
export default class EncryptionKeyStorage implements IEncryptionKeyStorage {
  getSharedKey(identifier: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const data = await db.get<sSharedKey>(
          storeNames.encrypt_sharedKey,
          identifier
        );
        resolve(data.key);
      } catch (err) {
        reject(err);
      }
    });
  }
  addSharedKey(key: sSharedKey): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const data = await db.upsert<sSharedKey>(storeNames.encrypt_sharedKey, [
          key,
        ]);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
