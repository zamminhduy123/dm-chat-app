import { MessageEntity } from "../../entities";
import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";

export interface AddMessageUseCase {
  execute: (message: MessageEntity) => void;
}

export class AddMessage implements AddMessageUseCase {
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(message: MessageEntity): Promise<any> {
    console.log(message);
    return this.msgRepo.addMessage(message);
  }
}
