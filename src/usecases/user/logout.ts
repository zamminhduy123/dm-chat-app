import { Credential, User } from "../../entities";
import { IUserRepository } from "../../repository";
import UserRepository from "../../repository/user/UserRepository";

export interface LogoutUseCase {
  execute: () => Promise<any>;
}

export class Logout implements LogoutUseCase {
  userRepo: IUserRepository;

  constructor(userRepo?: IUserRepository) {
    if (userRepo) this.userRepo = userRepo;
    else this.userRepo = new UserRepository();
  }

  async execute(): Promise<any> {
    return this.userRepo.logout();
  }
}
