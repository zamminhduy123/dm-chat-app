export default class LocalStorage {
  private _username: string;
  private _lastMessageId: string;
  private _myKey: string;
  private _hashKey: string;
  private static _instance: LocalStorage | null;

  setUser(username: string) {
    this._username = username;
    this._lastMessageId = `lastMessageId-${this._username}`;
    this._myKey = `myKey-${this._username}`;
    this._hashKey = `hashKey-${this._username}`;
    if (this._username) {
      this.resolveInit();
    }
  }

  private awaitInit: Promise<any>;
  private resolveInit: any;

  constructor() {
    this._username = "";
    this._lastMessageId = "";
    this._myKey = "";
    this._hashKey = "";
    this.awaitInit = new Promise((res, rej) => {
      this.resolveInit = res;
    });
  }

  destroy() {
    this._username = "";
    this._lastMessageId = "";
  }

  getLastMessageId() {
    return this._lastMessageId;
  }
  getDeviceKey() {
    return this._myKey + "-device";
  }
  getPrivateKey() {
    return this._myKey + "-private";
  }
  getPublicKey() {
    return this._myKey + "-public";
  }
  getHashKey() {
    return this._hashKey;
  }

  async getLocalStorage() {
    return new Promise<typeof window.localStorage>(async (resolve, reject) => {
      if (!this._username) await this.awaitInit;
      resolve(window.localStorage);
    });
  }
  static destroy() {
    this._instance = null;
  }

  static getInstance = (): LocalStorage => {
    if (this._instance == null) {
      this._instance = new LocalStorage();
    }
    return this._instance;
  };
}
