export default class LocalStorage {
  private _username: string;
  private _lastMessageId: string;
  private static _instance: LocalStorage | null;

  setUser(username: string) {
    this._username = username;
    this._lastMessageId = `lastMessageId-${this._username}`;
    if (this._username) {
      this.resolveInit();
    }
  }

  private awaitInit: Promise<any>;
  private resolveInit: any;

  constructor() {
    this._username = "";
    this._lastMessageId = "";
    this.awaitInit = new Promise((res, rej) => {
      this.resolveInit = res;
    });
  }

  destroy() {
    this._username = "";
    this._lastMessageId = "";
    this.awaitInit = new Promise((res, rej) => {
      this.resolveInit = res;
    });
  }

  getLastMessageId() {
    return this._lastMessageId;
  }

  async getLocalStorage() {
    return new Promise<any>(async (resolve, reject) => {
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
