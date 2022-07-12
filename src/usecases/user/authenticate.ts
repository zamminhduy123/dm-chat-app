import { Credential, User } from "../../entities";
import { IUserRepository } from "../../repository";
import UserRepository from "../../repository/user/UserRepository";

export interface AuthenticateUseCase {
  execute: (credential: Credential) => Promise<User>;
}

export class Authenticate implements AuthenticateUseCase {
  userRepo: IUserRepository;

  constructor(userRepo?: IUserRepository) {
    if (userRepo) this.userRepo = userRepo;
    else this.userRepo = new UserRepository();
  }

  async execute(): Promise<User> {
    return this.userRepo.authenticate();
  }
}
