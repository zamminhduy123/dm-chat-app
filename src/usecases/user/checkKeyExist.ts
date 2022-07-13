import { Credential, User } from "../../entities";
import { IUserRepository } from "../../repository";
import UserRepository from "../../repository/user/UserRepository";

export interface CheckKeyExistUseCase {
  execute: (username: string) => Promise<any>;
}

export class CheckKeyExist implements CheckKeyExistUseCase {
  userRepo: IUserRepository;

  constructor(userRepo?: IUserRepository) {
    if (userRepo) this.userRepo = userRepo;
    else this.userRepo = new UserRepository();
  }

  async execute(username: string): Promise<any> {
    return this.userRepo.checkKeyExist(username);
  }
}
