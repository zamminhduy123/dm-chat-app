import { Credential, User } from "../../entities";
import { IUserRepository } from "../../repository";
import UserRepository from "../../repository/user/UserRepository";

export interface SaveUserPKeyUseCase {
  execute: (
    username: string,
    pubKey: string,
    deviceKey: string,
    lastModified: number
  ) => Promise<any>;
}

export class SaveUserPKey implements SaveUserPKeyUseCase {
  userRepo: IUserRepository;

  constructor(userRepo?: IUserRepository) {
    if (userRepo) this.userRepo = userRepo;
    else this.userRepo = new UserRepository();
  }

  async execute(
    username: string,
    pubKey: string,
    deviceKey: string,
    lastModified: number
  ): Promise<any> {
    return this.userRepo.saveUserPKey(
      username,
      pubKey,
      deviceKey,
      lastModified
    );
  }
}
