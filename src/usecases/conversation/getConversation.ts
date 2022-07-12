import { Conversation, Credential, User } from "../../entities";
import { IConversationRepository } from "../../repository/conversation";
import ConversationRepository from "../../repository/conversation/ConversationRepository";

export interface GetConversationUseCase {
  execute: () => Promise<Conversation[]>;
}

export class GetConversation implements GetConversationUseCase {
  private converRepo: IConversationRepository;

  constructor(converRepo?: IConversationRepository) {
    if (converRepo) this.converRepo = converRepo;
    else this.converRepo = new ConversationRepository();
  }

  async execute(): Promise<Conversation[]> {
    return this.converRepo.getConversation();
  }
}
