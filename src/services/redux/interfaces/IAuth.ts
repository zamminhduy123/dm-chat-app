import { GenderEnum } from "../../../entities";

export interface IAuth {
  user: string;
  avatar: string;
  gender: GenderEnum;
  phone: string;
  name: string;

  error?: string;
  loading?: boolean;
}
