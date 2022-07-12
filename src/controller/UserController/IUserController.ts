import { Credential, RegisterData, User } from "../../entities";

export interface IUserController {
  find(content: string): Promise<User[]>;
  login(c: Credential): void;
  logout(): void;
  authenticate(): void;
  register(formData: RegisterData): Promise<any>;
}
