import { User, Credential, UserEntity } from "../../entities";
import { IUserRepository } from "./IUserRepository";
import Fetcher from "../../api";
import { RegisterData } from "../../entities/type/RegisterData";
import KeyDataSource from "../../dataSource/key";
import { LocalStorage } from "../../storage";

export default class UserRepository implements IUserRepository {
  async find(searchContent: string): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      Fetcher.findUser(searchContent)
        .then((data) => {
          let result: User[] = [];
          if (data) {
            result = data.map((el: any) => {
              return new User(
                el.username,
                el.name,
                el.gender,
                el.avatar,
                el.phone
              );
            });
          }
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  async register(userData: RegisterData): Promise<any> {
    return new Promise<User>((resolve, reject) => {
      Fetcher.register(userData)
        .then((data: any) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  async authenticate(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      Fetcher.authenticate()
        .then((data) => {
          resolve(
            new User(
              data.username,
              data.name,
              data.gender,
              data.avatar,
              data.phone
            )
          );
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  async login(credential: Credential): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      Fetcher.login(credential.username, credential.password)
        .then((data) => {
          resolve(
            new User(
              data.username,
              data.name,
              data.gender,
              data.avatar,
              data.phone
            )
          );
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  async logout(): Promise<any> {
    KeyDataSource.getInstance().setUsername("");
    return new Promise<any>((resolve, reject) => {
      Fetcher.logout()
        .then((response) => {
          resolve(1);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  async checkKeyExist(username: string): Promise<any> {
    KeyDataSource.getInstance().setUsername(username);
    LocalStorage.getInstance().setUser(username);

    return new Promise<any>(async (resolve, reject) => {
      try {
        await KeyDataSource.getInstance().sendPublicKeyToServer();
        resolve(1);
      } catch (err) {
        reject(err);
      }
    });
  }
  async saveUserPKey(
    username: string,
    pubKey: string,
    deviceKey: string
  ): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        await KeyDataSource.getInstance().saveNewSharedKey(
          username,
          pubKey,
          deviceKey
        );
        resolve(1);
      } catch (err) {
        reject(err);
      }
    });
  }
}
