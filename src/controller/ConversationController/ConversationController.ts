import {
  Conversation,
  ConversationEntity,
  MessageEntity,
} from "../../entities";
import { IConversationController } from "./IConversationController";
import { GetConversation } from "../../usecases/conversation";
import ConversationRepository from "../../repository/conversation/ConversationRepository";
import { BaseController } from "../BaseController";
import {
  addConversation,
  selectConversation,
  setConversation,
  updateConversation,
  updateLastMessage,
} from "../../services/redux/states/conversation/conversation.action";
import * as Helper from "./helper";
import { NewConversation } from "../../entities/type/NewConversation";
import { AddConversation } from "../../usecases/conversation/addConversation";
import { SyncConversation } from "../../usecases/conversation/syncConversation";
import { UpdateConversation } from "../../usecases/conversation/updateConversation";
import { AddGroupConversation } from "../../usecases/conversation/addGroupConversation";
import {
  selectMessage,
  setTotalMessage,
} from "../../services/redux/states/message/message.action";

class ConversationController
  extends BaseController
  implements IConversationController
{
  private static _instance: ConversationController | null = null;

  private _conversationRepo: ConversationRepository;
  private _getConversationUseCase: GetConversation;
  private _addNewConversationUseCase: AddConversation;
  private _addNewGroupConversationUseCase: AddGroupConversation;
  private _syncConversationUseCase: SyncConversation;
  private _updateConversationUseCase: UpdateConversation;

  constructor() {
    super();
    this._conversationRepo = new ConversationRepository();
    this._getConversationUseCase = new GetConversation(this._conversationRepo);
    this._addNewConversationUseCase = new AddConversation(
      this._conversationRepo
    );
    this._addNewGroupConversationUseCase = new AddGroupConversation(
      this._conversationRepo
    );
    this._updateConversationUseCase = new UpdateConversation(
      this._conversationRepo
    );
    this._syncConversationUseCase = new SyncConversation(
      this._conversationRepo
    );
    this.getConversations();
  }
  static destroy() {
    this._instance = null;
  }

  public static getInstance(): ConversationController {
    if (this._instance === null) {
      this._instance = new ConversationController();
    }
    return this._instance;
  }
  syncConversations() {
    this._syncConversationUseCase
      .execute(this._getState().auth.user)
      .then((data: Conversation[]) => {
        // this.getConversations();
        // resolve(1);

        //perform redux update
        for (const conversation of Helper.conversationModelToEntity(data)) {
          this._dispatch(updateConversation(conversation));
        }
      })
      .catch((err) => {
        console.error("syncConversations error", err);
      });
  }

  updateConversation(conversation: ConversationEntity) {
    if (conversation.lastMessage?.sender !== this._getState().auth.user)
      this._dispatch(
        updateConversation(Helper.convertLastMessage(conversation))
      );
    this._updateConversationUseCase.execute(conversation).then((data) => {});
  }

  updateNewMessage(messageEntity: MessageEntity) {
    const convertMessage = Helper.convertMessage(messageEntity);
    console.log("UPDATE LAST MESSAGE", convertMessage);
    this._dispatch(updateLastMessage(convertMessage));
  }

  getConversations() {
    this._getConversationUseCase.execute().then((data) => {
      this._dispatch(setConversation(Helper.conversationModelToEntity(data)));
    });
  }

  select(conversation_id: string, atMsg?: MessageEntity) {
    const existed = this.findConversation(conversation_id);
    if (existed) {
      this._dispatch(selectConversation(conversation_id));
      this._dispatch(selectMessage(atMsg));
      this._dispatch(setTotalMessage(+existed.totalMessage));
    } else {
      this._dispatch(selectConversation(""));
      this._dispatch(setTotalMessage(0));
    }
  }
  findConversation(conversation_id: string): ConversationEntity | undefined {
    const existed = this._getState().conversation.conversations.find(
      (conv: ConversationEntity) => conv.id === conversation_id
    );
    return existed;
  }

  findConversationByUsername(username: string) {
    const { conversations } = this._getState().conversation;
    for (const conversation of conversations) {
      if (conversation.users.length === 2)
        for (const user of conversation.users) {
          // console.log("find", conversation, username, "vs", user);
          if (username === user.username) {
            return conversation;
          }
        }
    }
    return null;
  }
  addNewConversation = (conversation: ConversationEntity): void => {
    this._dispatch(addConversation(conversation));

    this._addNewConversationUseCase
      .execute(conversation)
      .then((data) => {
        // this._dispatch(addConversation(conversation));
      })
      .catch((err) => {
        throw err;
      });
  };
  addNewGroupConversation = async (conversation: ConversationEntity) => {
    try {
      const addedGroup = await this._addNewGroupConversationUseCase.execute(
        conversation
      );

      this._dispatch(addConversation(addedGroup));
    } catch (err) {
      throw err;
    }
  };
}

export default ConversationController;
