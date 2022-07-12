import { Credential, User } from "../../entities";
import { IUserRepository } from "../../repository";
import UserRepository from "../../repository/user/UserRepository";

export interface LoginUseCase {
  execute: (credential: Credential) => Promise<User>;
}

export class Login implements LoginUseCase {
  userRepo: IUserRepository;

  constructor(userRepo?: IUserRepository) {
    if (userRepo) this.userRepo = userRepo;
    else this.userRepo = new UserRepository();
  }

  async execute(credential: Credential): Promise<User> {
    return this.userRepo.login(credential);
  }
}
