import { User, Credential } from "../../entities";
import { RegisterData } from "../../entities/type/RegisterData";

export interface IUserRepository {
  login(credential: Credential): Promise<User>;
  logout(): Promise<any>;
  authenticate(): Promise<User>;
  register(userData: RegisterData): Promise<any>;
  find(content: string): Promise<User[]>;
}
