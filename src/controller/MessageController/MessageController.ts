import { IMessageController } from "./IMessageController";
import { BaseController } from "../BaseController";
import MessageRepository from "../../repository/message/MessageRepository";
import { GetMessageFromConversation, AddMessage } from "../../usecases/message";
import {
  addMessage,
  loadMoreMessages,
  setMessage,
  updateMessage,
  updateSentMessage,
} from "../../services/redux/states/message/message.action";
import * as Helper from "./helper";
import { SyncMessage } from "../../usecases/message/syncMessage";
import {
  Message,
  MessageEntity,
  MessageEnum,
  NewMessage,
} from "../../entities";
import { generateClientId, mapTypeMessage } from "../../utils/utils";
import { UpdateMessage } from "../../usecases/message/updateMessage";
import { ResendPendingMessage } from "../../usecases/message/resendPendingMessage";
import { GetFileUrl } from "../../usecases/message/getFileUrl";
import ConversationController from "../ConversationController/ConversationController";
import { SearchMessageByKeyword } from "../../usecases/message/searchMessageByKeyword";
import EventEmitter from "../../utils/event-emitter";
import { messageConstants } from "../../view/action";
import { standardConversationArray } from "../../repository/conversation/helpers";
import { standardMessageArray } from "../../repository/message/helpers";

export default class MessageController
  extends BaseController
  implements IMessageController
{
  private static _instance: MessageController | null = null;

  private _messageRepo: MessageRepository;
  private _getMessageFromConversationUseCase: GetMessageFromConversation;
  private _syncMessageUseCase: SyncMessage;
  private _addMessageUseCase: AddMessage;
  private _updateMessageUseCase: UpdateMessage;
  private _resendPendingMessageUseCase: ResendPendingMessage;
  private _getFileUrlUseCase: GetFileUrl;
  private _searchMessageByKeywordUseCase: SearchMessageByKeyword;

  private syncAttemp = 0;
  constructor() {
    super();
    this._messageRepo = new MessageRepository(this._getState().auth.user);
    this._getMessageFromConversationUseCase = new GetMessageFromConversation(
      this._messageRepo
    );
    this._syncMessageUseCase = new SyncMessage(this._messageRepo);
    this._addMessageUseCase = new AddMessage(this._messageRepo);
    this._updateMessageUseCase = new UpdateMessage(this._messageRepo);
    this._getFileUrlUseCase = new GetFileUrl(this._messageRepo);
    this._searchMessageByKeywordUseCase = new SearchMessageByKeyword(
      this._messageRepo
    );
    this._resendPendingMessageUseCase = new ResendPendingMessage(
      this._messageRepo
    );
  }

  syncMessage() {
    this._syncMessageUseCase
      .execute(this._getState().conversation.selected)
      .then((data) => {
        if (this.syncAttemp === 0) {
          // this._resendPendingMessageUseCase
          //   .execute()
          //   .then((data) => this.getAllMesssageFromConversation())
          //   .catch(console.log);
        }
        this.getMesssageFromConversation();
        this.syncAttemp++;
      })
      .catch((err) => {
        //if user's network still good but axios network error -> server down -> logout
        console.log(err);
      });
  }
  async getMesssageFromConversation() {
    try {
      const atMsgId = this._getState().conversation.atMsgId;

      const data = await this._getMessageFromConversationUseCase.execute(
        this._getState().conversation.selected,
        Date.now()
      );

      const messages = Helper.conversationModelToEntity(data);
      this._dispatch(setMessage(messages));
    } catch (err) {
      //if user's network still good but axios network error -> server down -> logout
      console.log(err);
    }
  }
  async loadUntilReachId(currentMessage: MessageEntity) {
    try {
      const atMsgId = this._getState().conversation.atMsgId;
      if (currentMessage.id! > atMsgId) {
        await this.loadMoreMessageFromConversation(
          new Date(+currentMessage.create_at).getTime()
        );
      }
      if (this._getState().message.messages[0].id > atMsgId) {
        await this.loadUntilReachId(this._getState().message.messages[0]);
      }
    } catch (err) {
      //if user's network still good but axios network error -> server down -> logout
      console.log(err);
    }
  }
  async loadMoreMessageFromConversation(from: number) {
    ConversationController.getInstance().select(
      this._getState().conversation.selected,
      ""
    );
    try {
      // console.log("LOAD FROM", from);
      const data = await this._getMessageFromConversationUseCase.execute(
        this._getState().conversation.selected,
        from - 1
      );
      this._dispatch(loadMoreMessages(Helper.conversationModelToEntity(data)));
      if (data) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      //if user's network still good but axios network error -> server down -> logout
      console.log(err);
    }
  }
  sendMessage = async (message: MessageEntity) => {
    try {
      //don't have conversation_id
      this._addMessageUseCase.execute(message);
    } catch (err) {
      console.log(err);
    }
  };

  createTempMessage = (newMessage: NewMessage, to?: string[]) => {
    try {
      const newMessageEntity = Helper.newMessageToMessageEntity(
        newMessage,
        to ? to : []
      );
      this._dispatch(addMessage(newMessageEntity));
      return newMessageEntity;
    } catch (err) {
      throw err;
    }
  };
  getFileUrl = async (file: File, clientId: string) => {
    try {
      let url = await this._getFileUrlUseCase.execute(
        file,
        (progress: number) => {
          // console.log(progress);
          EventEmitter.emit(messageConstants.PROGRESS_UPLOAD, {
            progress,
            clientId,
          });
        }
      );
      return url;
    } catch (err) {
      throw err;
    }
  };
  updateMessage = (updatedMessage: MessageEntity, sentUpdate = false) => {
    if (sentUpdate) {
      this._addMessageUseCase
        .execute(updatedMessage)
        .then((data) => {
          // console.log(updatedMessage);
          this._dispatch(updateSentMessage(updatedMessage));
        })
        .catch((err) => {
          //if user's network still good but axios network error -> server down -> logout
          console.log(err);
        });
    } else {
      this._updateMessageUseCase
        .execute(updatedMessage)
        .then((data) => {
          this._dispatch(updateMessage(updatedMessage));
        })
        .catch((err) => {
          //if user's network still good but axios network error -> server down -> logout
          console.log(err);
        });
    }
  };

  resendMessage = (message: MessageEntity) => {
    // this._addMessageUseCase.execute(message);
  };

  receiveMessage = (message: MessageEntity) => {
    // console.log(message, this._getState().conversation.selected);
    if (message.conversation_id === this._getState().conversation.selected) {
      this._dispatch(addMessage(message));
    }
    this._addMessageUseCase.execute(message);
  };

  //search message
  searchMessage = async (keyword: string) => {
    try {
      const messages = await this._searchMessageByKeywordUseCase.execute(
        keyword
      );
      return messages;
    } catch (err) {
      throw err;
    }
  };

  clearMessage() {
    this._dispatch(setMessage([]));
  }

  static destroy() {
    this._instance = null;
  }

  static getInstance = (): MessageController => {
    if (this._instance == null) {
      this._instance = new MessageController();
    }
    return this._instance;
  };
}
