export enum GenderEnum {
  female = 1,
  male = 0,
  other = 2,
}

class User {
  private _username: string = "";
  private _name: string = "";
  private _gender: GenderEnum;
  private _avatar: string;
  private _phone: string;

  constructor(
    username: string,
    name: string,
    gender: GenderEnum,
    avatar: string,
    phone: string
  ) {
    this._username = username;
    this._name = name;
    this._gender = gender;
    this._avatar = avatar;
    this._phone = phone;
  }

  getPhone(): string {
    return this._phone;
  }
  setPhone(phone: string) {
    this._phone = phone;
  }

  getAvatar(): string {
    return this._avatar;
  }

  setAvatar(newAva: string) {
    this._avatar = newAva;
  }

  getUsername(): string {
    return this._username;
  }

  setUsername(newUsername: string) {
    this._username = newUsername;
  }

  getName(): string {
    return this._name;
  }

  setName(newName: string): void {
    this._name = newName;
  }

  getGender(): GenderEnum {
    return this._gender;
  }

  setEmail(newGender: GenderEnum): void {
    this._gender = newGender;
  }
}

export { User };
