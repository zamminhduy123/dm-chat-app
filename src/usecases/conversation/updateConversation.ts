import { ConversationEntity } from "../../entities";
import { IConversationRepository } from "../../repository/conversation";
import ConversationRepository from "../../repository/conversation/ConversationRepository";

export interface UpdateConversationUseCase {
  execute: (updatedConversation: ConversationEntity) => Promise<any>;
}

export class UpdateConversation implements UpdateConversationUseCase {
  private converRepo: IConversationRepository;

  constructor(converRepo?: IConversationRepository) {
    if (converRepo) this.converRepo = converRepo;
    else this.converRepo = new ConversationRepository();
  }

  async execute(updatedConversation: ConversationEntity): Promise<any> {
    return this.converRepo.updateConversation(updatedConversation);
  }
}
