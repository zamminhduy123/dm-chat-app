export class WebCrypto {
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

  private crypto = window.crypto;

  async decrypt(
    rawKey: BufferSource,
    data: BufferSource,
    iv: BufferSource,
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm = WebCrypto.SYMMETRIC_ALGORITHM
  ): Promise<ArrayBuffer> {
    try {
      const key = await this.crypto.subtle.importKey(
        "raw",
        rawKey,
        algorithm,
        false,
        ["decrypt"]
      );
      const decryptedAlgParams = {
        ...(typeof algorithm !== "string" ? algorithm : { name: algorithm }),
        iv,
      };
      return await this.crypto.subtle.decrypt(decryptedAlgParams, key, data);
    } catch (err) {
      console.log(err);
      throw new Error("Error decrypting data");
    }
  }

  async encrypt(
    rawKey: BufferSource,
    data: BufferSource,
    iv: BufferSource,
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm = WebCrypto.SYMMETRIC_ALGORITHM
  ): Promise<ArrayBuffer> {
    try {
      const key = await this.crypto.subtle.importKey(
        "raw",
        rawKey,
        algorithm,
        false,
        ["encrypt"]
      );
      const encryptedAlgParams = {
        ...(typeof algorithm !== "string" ? algorithm : { name: algorithm }),
        iv,
      };
      return await this.crypto.subtle.encrypt(encryptedAlgParams, key, data);
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async sign(
    rawKey: BufferSource,
    data: BufferSource,
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm = WebCrypto.SIGN_ALGORITHM
  ): Promise<ArrayBuffer> {
    try {
      const key = await this.crypto.subtle.importKey(
        "raw",
        rawKey,
        algorithm,
        false,
        ["sign"]
      );
      return this.crypto.subtle.sign(algorithm, key, data);
    } catch (err: any) {
      throw new Error(err);
    }
  }
}

const Crypto = new WebCrypto();
export default Crypto;
