import { IUserController } from "./IUserController";
import { Login, Logout, Register, Authenticate } from "../../usecases/user";
import UserRepository from "../../repository/user/UserRepository";
import { Credential, User } from "../../entities";

import {
  loginRequest,
  loginSuccess,
  loginFail,
  logoutRequest,
  logoutFail,
  logoutSuccess,
} from "../../services/redux/states/auth/auth.action";
import { RegisterData } from "../../entities/type/RegisterData";
import { BaseController } from "../BaseController";
import SocketController from "../SocketController/SocketController";
import { Find } from "../../usecases/user/find";

import StorageController from "../StorageController/StorageController";
import ConversationController from "../ConversationController/ConversationController";
import MessageController from "../MessageController/MessageController";
import { LocalStorage } from "../../storage";
import { CheckKeyExist } from "../../usecases/user/checkKeyExist";
import { SaveUserPKey } from "../../usecases/user/saveUserPKey";
import eventEmitter from "../../utils/event-emitter";
import { proto } from "../../utils/MessageExtraMeta/MessageExtraMeta";

export default class UserController
  extends BaseController
  implements IUserController
{
  private static _instance: UserController | null = null;

  private _userRepo: UserRepository;
  private _loginUseCase: Login;
  private _logoutUseCase: Logout;
  private _registerUseCase: Register;
  private _authenticateUseCase: Authenticate;
  private _findUseCase: Find;
  private _checkKeyExistUseCase: CheckKeyExist;
  private _saveUserPKey: SaveUserPKey;

  constructor() {
    super();
    this._userRepo = new UserRepository();
    this._loginUseCase = new Login(this._userRepo);
    this._logoutUseCase = new Logout(this._userRepo);
    this._registerUseCase = new Register(this._userRepo);
    this._authenticateUseCase = new Authenticate(this._userRepo);
    this._findUseCase = new Find(this._userRepo);
    this._checkKeyExistUseCase = new CheckKeyExist(this._userRepo);
    this._saveUserPKey = new SaveUserPKey(this._userRepo);
  }
  static destroy() {
    this._instance = null;
  }

  static getInstance = (): UserController => {
    if (this._instance == null) {
      this._instance = new UserController();
    }
    return this._instance;
  };

  async find(content: string): Promise<User[]> {
    return await this._findUseCase.execute(content);
  }

  private async authenSuccess(username: string) {
    //establish socket connection
    SocketController.getInstance().init();
    StorageController.getInstance().connect();
    LocalStorage.getInstance().setUser(username);

    try {
      await this.checkKeyExist(username);
    } catch (err) {
      console.error("Cannot load message.proto");
    }
  }

  checkKeyExist = async (username: string) => {
    console.log("check key", username);
    try {
      //load proto
      await proto.load();
      console.log();
      await this._checkKeyExistUseCase.execute(username);
      console.log("KEY SENT TO SERVER");
    } catch (err) {
      console.error("CHECK KEY ERROR: ", err);
    }
  };

  saveUserPKey = async (
    username: string,
    pubKey: string,
    deviceKey: string
  ) => {
    try {
      await this._saveUserPKey.execute(username, pubKey, deviceKey);
    } catch (err) {
      console.error("SAVE NEW KEY ERROR: ", err);
    }
  };

  authenticate = async () => {
    try {
      const data = await this._authenticateUseCase.execute();
      // console.log("Authenticate usecase: ", data);
      const newState = {
        user: data.getUsername(),
        avatar: data.getAvatar(),
        phone: data.getPhone(),
        gender: data.getGender(),
        name: data.getName(),
      };
      this._dispatch(loginSuccess(newState));
      await this.authenSuccess(data.getUsername());
    } catch (err: any) {
      console.log(err);
    }
  };

  login = async (credential: Credential) => {
    this._dispatch(loginRequest());
    try {
      const data = await this._loginUseCase.execute(credential);
      // console.log("login usecase", data);
      const newState = {
        user: data.getUsername(),
        avatar: data.getAvatar(),
        phone: data.getPhone(),
        gender: data.getGender(),
        name: data.getName(),
      };
      this._dispatch(loginSuccess(newState));

      await this.authenSuccess(data.getUsername());
    } catch (err: any) {
      if (
        err.message === "User not found" ||
        err.message === "Incorrect password"
      )
        this._dispatch(loginFail("Wrong username or password"));
      else this._dispatch(loginFail(err.message));
    }
  };

  logout = async () => {
    this._dispatch(logoutRequest());
    try {
      this._dispatch({ type: "RESET" });
      await this._logoutUseCase.execute();
      SocketController.getInstance().disconnect();
      SocketController.destroy();
      ConversationController.destroy();
      MessageController.destroy();
      StorageController.destroy();
      UserController._instance = null;
      LocalStorage.destroy();
      this._dispatch(logoutSuccess());
    } catch (err: any) {
      this._dispatch(logoutFail(err.message));
    }
  };

  register = async (formData: RegisterData): Promise<any> => {
    console.log(formData);
    return await this._registerUseCase.execute(formData);
  };
}
