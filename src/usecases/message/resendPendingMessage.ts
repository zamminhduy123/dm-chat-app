import { MessageEntity } from "../../entities";
import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";

export interface ResendPendingMessageUseCase {
  execute: (message: MessageEntity) => void;
}

export class ResendPendingMessage implements ResendPendingMessageUseCase {
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(): Promise<any> {
    return this.msgRepo.resendPendingMessage();
  }
}
