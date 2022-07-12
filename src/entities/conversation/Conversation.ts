import { Message } from "../message";
import { User } from "../user/User";

class Conversation {
  private id: string;
  private name: string;
  private avatar: string;
  private users: Array<User>;
  private lastMessage: Message | null;
  private totalMessage: number;

  constructor(
    id: string,
    name: string,
    users: Array<User>,
    avatar: string,
    lastMessage: Message | null,
    totalMessage: number
  ) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.users = users;
    this.lastMessage = lastMessage;
    this.totalMessage = totalMessage;
  }
  public getAvatar(): string {
    return this.avatar;
  }
  public setAvatar(value: string) {
    this.avatar = value;
  }
  public isDirect(): Boolean {
    return this.users.length === 2;
  }
  getTotalMessage(): number {
    return this.totalMessage;
  }
  getId(): string {
    return this.id;
  }
  getName(): string {
    return this.name;
  }

  setName(newName: string) {
    this.name = newName;
  }

  getUsers(): Array<User> {
    return this.users;
  }

  setUsers(users: Array<User>): void {
    this.users = users;
  }

  getLastMessage(): Message | null {
    return this.lastMessage;
  }

  setLastMessage(newMessage: Message) {
    this.lastMessage = newMessage;
  }
}

export { Conversation };
