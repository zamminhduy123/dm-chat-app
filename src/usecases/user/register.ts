import { IUserRepository } from "../../repository";
import UserRepository from "../../repository/user/UserRepository";
import { RegisterData } from "../../entities/type/RegisterData";

export interface RegisterUseCase {
  execute: (data: RegisterData) => Promise<any>;
}

export class Register implements RegisterUseCase {
  userRepo: IUserRepository;

  constructor(userRepo?: IUserRepository) {
    if (userRepo) this.userRepo = userRepo;
    else this.userRepo = new UserRepository();
  }

  async execute(data: RegisterData): Promise<any> {
    return this.userRepo.register(data);
  }
}
