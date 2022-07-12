import { MessageEntity } from "../../entities";
import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";

export interface UpdateMessageUseCase {
  execute: (message: MessageEntity, key?: string) => void;
}

export class UpdateMessage implements UpdateMessageUseCase {
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(message: MessageEntity, key?: string): Promise<any> {
    return this.msgRepo.updateMessage(message, key);
  }
}
