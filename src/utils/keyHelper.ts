import { getDiffieHellman } from "diffie-hellman";
import { Key } from "../entities/type/Key";

class KeyHelper {
  private getDiffieHellman: any;
  private DH: any;
  constructor() {
    this.getDiffieHellman = require("diffie-hellman").getDiffieHellman;
    this.DH = this.getDiffieHellman("modp15");
  }

  private static _instance: KeyHelper | null = null;
  public static getInstance = () => {
    if (!this._instance) this._instance = new KeyHelper();
    return this._instance;
  };

  createKeyPair = (): Key => {
    this.DH.generateKeys();

    return {
      privateKey: this.DH.getPrivateKey("hex"),
      publicKey: this.DH.getPublicKey("hex"),
    };
  };

  calculateSharedKey = async (myPrivateKey: string, theirPublicKey: string) => {
    this.DH.setPrivateKey(myPrivateKey, "hex");
    return this.DH.computeSecret(theirPublicKey, "hex", "hex");
  };
}
export default KeyHelper;
