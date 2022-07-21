import { GenderEnum } from "./User";

export type UserEntity = {
  username: string;
  name: string;
  gender: GenderEnum;
  avatar: string;
  phone: string;
  hashKey?: string;
};
