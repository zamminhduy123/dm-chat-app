import { Conversation, Credential, User } from "../../entities";
import { IConversationRepository } from "../../repository/conversation";
import ConversationRepository from "../../repository/conversation/ConversationRepository";

export interface SyncConversationUseCase {
  execute: (username: string) => Promise<Conversation[]>;
}

export class SyncConversation implements SyncConversationUseCase {
  private converRepo: IConversationRepository;

  constructor(converRepo?: IConversationRepository) {
    if (converRepo) this.converRepo = converRepo;
    else this.converRepo = new ConversationRepository();
  }

  async execute(username: string): Promise<Conversation[]> {
    return this.converRepo.syncConversation(username);
  }
}
