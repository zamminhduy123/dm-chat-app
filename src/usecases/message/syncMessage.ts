import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";

export interface SyncMessageUseCase {
  execute: (username: string) => Promise<any>;
}

export class SyncMessage implements SyncMessageUseCase {
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(): Promise<any> {
    return this.msgRepo.syncMessage();
  }
}
