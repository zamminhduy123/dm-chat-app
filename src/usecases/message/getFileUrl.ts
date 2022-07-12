import { MessageEntity } from "../../entities";
import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";

export interface GetFileUrlUseCase {
  execute(file: File): Promise<any>;
}

export class GetFileUrl implements GetFileUrlUseCase {
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(file: File, onProgress?: Function): Promise<any> {
    return this.msgRepo.getFileUrl(file, onProgress);
  }
}
