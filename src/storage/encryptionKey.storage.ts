import db, { indexName, storeNames } from "./storageAdapter";
import { sConversationEntity } from "./storageEntity";
import { sKey } from "./storageEntity/sKey";
import { sSharedKey } from "./storageEntity/sShareKey";

interface IEncryptionKeyStorage {
  getPublicKey(identifier: string, deviceKey: string): Promise<string>;
  addPublicKey(key: sSharedKey): Promise<any>;
}
export default class EncryptionKeyStorage implements IEncryptionKeyStorage {
  getPublicKey(identifier: string, deviceKey?: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        if (deviceKey) {
          const data = await db.get<sSharedKey>(storeNames.encrypt_sharedKey, [
            identifier,
            deviceKey,
          ]);
          if (data) resolve(data.key);
          else resolve("");
        } else {
          const data = await db.getMany<sSharedKey[]>(
            storeNames.encrypt_sharedKey,
            1,
            [identifier, "0"],
            [identifier, "z"],
            "prev"
          );
          // console.log(data);
          if (data && data.length) resolve(data[0].key);
          else resolve("");
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  addPublicKey(key: sSharedKey): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        // console.log("KEY", key);
        const data = await db.update<sSharedKey>(storeNames.encrypt_sharedKey, [
          key,
        ]);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
