import { store } from "../services/redux";
export class BaseController {
  protected _getState;
  protected _dispatch;

  constructor() {
    this._dispatch = store.dispatch;
    this._getState = store.getState;
  }
}
