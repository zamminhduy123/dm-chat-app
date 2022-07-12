import {
  Conversation,
  ConversationEntity,
  Credential,
  User,
} from "../../entities";
import { IConversationRepository } from "../../repository/conversation";
import ConversationRepository from "../../repository/conversation/ConversationRepository";

export interface AddConversationUseCase {
  execute: (newConversation: ConversationEntity) => Promise<any>;
}

export class AddConversation implements AddConversationUseCase {
  private converRepo: IConversationRepository;

  constructor(converRepo?: IConversationRepository) {
    if (converRepo) this.converRepo = converRepo;
    else this.converRepo = new ConversationRepository();
  }

  async execute(newConversation: ConversationEntity): Promise<any> {
    return this.converRepo.addConversation(newConversation);
  }
}
