import { Message } from "../../entities";
import {
  IMessageRepository,
  MessageRepository,
} from "../../repository/message";

export interface GetMessageFromConversationUseCase {
  execute: (conversationId: string, from: number) => Promise<Message[]>;
}

export class GetMessageFromConversation
  implements GetMessageFromConversationUseCase
{
  private msgRepo: IMessageRepository;

  constructor(msgRepo: IMessageRepository) {
    this.msgRepo = msgRepo;
  }

  async execute(conversationId: string, from: number): Promise<Message[]> {
    return this.msgRepo.getMessageByConversationId(conversationId, from);
  }
}
