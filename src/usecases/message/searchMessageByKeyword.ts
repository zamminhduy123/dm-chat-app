import { Message, MessageEntity } from "../../entities";
import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";

export interface SearchMessageByKeywordUseCase {
  execute: (kw: string) => Promise<Message[]>;
}

export class SearchMessageByKeyword implements SearchMessageByKeywordUseCase {
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(kw: string): Promise<Message[]> {
    return this.msgRepo.searchByKeyword(kw);
  }
}
