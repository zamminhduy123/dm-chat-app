import { Key } from "../entities/type/Key";

import { sharedKey, generateKeyPair } from "curve25519-js";

export function arrayBufferToString(
  b: ArrayBuffer,
  enc?: BufferEncoding
): string {
  return Buffer.from(b).toString(enc);
}
export function uint8ArrayToString(arr: Uint8Array): string {
  const end = arr.length;
  let begin = 0;
  if (begin === end) return "";
  let chars: number[] = [];
  const parts: string[] = [];
  while (begin < end) {
    chars.push(arr[begin++]);
    if (chars.length >= 1024) {
      parts.push(String.fromCharCode(...chars));
      chars = [];
    }
  }
  return parts.join("") + String.fromCharCode(...chars);
}

class KeyHelper {
  constructor() {}

  static readonly SIGN_ALGORITHM: HmacImportParams = {
    name: "HMAC",
    hash: {
      name: "SHA-256",
    },
  };
  static readonly SYMMETRIC_ALGORITHM: AesKeyAlgorithm = {
    name: "AES-CBC",
    length: 256,
  };

  static readonly DERIVE_ALGORITHM: HkdfParams = {
    name: "HKDF",
    salt: new TextEncoder().encode("SUPER SALTY SALT"),
    hash: "SHA-256",
    info: new Uint8Array([]),
  };

  private crypto = window.crypto;

  async decrypt(
    rawKey: string,
    data: string,
    iv: BufferSource = new Uint8Array(16),
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm = KeyHelper.SYMMETRIC_ALGORITHM
  ): Promise<string> {
    try {
      const key = await this.deriveKey(Buffer.from(rawKey, "base64"));
      const decryptedAlgParams = {
        ...(typeof algorithm !== "string" ? algorithm : { name: algorithm }),
        iv,
      };
      console.log("start decrypt", data);
      const data1 = await this.crypto.subtle.decrypt(
        decryptedAlgParams,
        key,
        Buffer.from(data, "base64")
      );
      console.log("end decrypt", data1);
      return arrayBufferToString(data1);
    } catch (err) {
      throw err;
    }
  }

  async encrypt(
    rawKey: string,
    data: string,
    iv: BufferSource = new Uint8Array(16),
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm = KeyHelper.SYMMETRIC_ALGORITHM
  ): Promise<string> {
    try {
      const key = await this.deriveKey(Buffer.from(rawKey, "base64"));
      const encryptedAlgParams = {
        ...(typeof algorithm !== "string" ? algorithm : { name: algorithm }),
        iv,
      };
      const data1 = await this.crypto.subtle.encrypt(
        encryptedAlgParams,
        key,
        Buffer.from(data)
      );
      return arrayBufferToString(data1, "base64");
    } catch (err: any) {
      throw new Error(err);
    }
  }

  private deriveKey = async (rawKey: BufferSource) => {
    try {
      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "HKDF" },
        false,
        ["deriveKey"]
      );
      return await this.crypto.subtle.deriveKey(
        KeyHelper.DERIVE_ALGORITHM,
        keyMaterial,
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    } catch (err) {
      console.error(err);
      throw new Error("Error derive key");
    }
  };

  stringToArrayBuffer(str: string, enc?: BufferEncoding): ArrayBuffer {
    return Buffer.from(str, enc);
  }

  private static _instance: KeyHelper | null = null;
  public static getInstance = () => {
    if (!this._instance) this._instance = new KeyHelper();
    return this._instance;
  };

  sha256 = async (str: string) => {
    const buf = await this.crypto.subtle.digest(
      "SHA-256",
      this.stringToArrayBuffer(str, "base64")
    );
    return buf;
  };

  createKeyPair = async (username: string): Promise<Key> => {
    const byteArray = new Uint8Array(32);
    const keyPair = generateKeyPair(window.crypto.getRandomValues(byteArray));
    const privKey = Buffer.from(keyPair.private).toString("base64");
    const pubKey = Buffer.from(keyPair.public).toString("base64");

    return {
      privateKey: privKey,
      publicKey: pubKey,
      deviceKey: arrayBufferToString(
        await this.sha256(username + Date.now().toString()),
        "base64"
      ),
    };
  };

  calculateSharedKey = async (myPrivateKey: string, theirPublicKey: string) => {
    const secret = sharedKey(
      Uint8Array.from(Buffer.from(myPrivateKey, "base64")),
      Uint8Array.from(Buffer.from(theirPublicKey, "base64"))
    );

    return Buffer.from(secret).toString("base64");
  };
}
export default KeyHelper;
