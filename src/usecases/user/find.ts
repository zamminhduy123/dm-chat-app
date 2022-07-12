import { Credential, User } from "../../entities";
import { IUserRepository } from "../../repository";
import UserRepository from "../../repository/user/UserRepository";

export interface FindUseCase {
  execute: (content: string) => Promise<User[]>;
}

export class Find implements FindUseCase {
  userRepo: IUserRepository;

  constructor(userRepo?: IUserRepository) {
    if (userRepo) this.userRepo = userRepo;
    else this.userRepo = new UserRepository();
  }

  async execute(content: string): Promise<User[]> {
    return this.userRepo.find(content);
  }
}
