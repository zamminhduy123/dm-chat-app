import { UserEntity } from "../../../entities";

export interface IUser {
  info: UserEntity | null;
  error?: string;
  loading?: boolean;
}
