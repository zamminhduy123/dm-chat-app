import { User, Credential, UserEntity } from "../../entities";
import { IUserRepository } from "./IUserRepository";
import Fetcher from "../../api";
import { RegisterData } from "../../entities/type/RegisterData";

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
}
