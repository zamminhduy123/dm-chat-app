import db from "../../storage/storageAdapter";
import { default as searchDb } from "../../storage/storageAdapter/searchDB";
import { BaseController } from "../BaseController";

export default class StorageController extends BaseController {
  private static _instance: StorageController | null = null;

  constructor() {
    super();
  }

  sendPendingMessage() {}

  connect() {
    db.setDBName(this._getState().auth.user);
    searchDb.setDBName(this._getState().auth.user);
  }
  static destroy() {
    this._instance = null;
  }

  static getInstance = (): StorageController => {
    if (this._instance == null) {
      this._instance = new StorageController();
    }
    return this._instance;
  };
}
