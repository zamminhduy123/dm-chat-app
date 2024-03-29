import { IMessageController } from "./IMessageController";
import { BaseController } from "../BaseController";
import MessageRepository from "../../repository/message/MessageRepository";
import { GetMessageFromConversation, AddMessage } from "../../usecases/message";
import {
  addMessage,
  deleteMessage,
  loadMoreMessages,
  setMessage,
  updateMessage,
  updateSentMessage,
} from "../../services/redux/states/message/message.action";
import * as Helper from "./helper";
import { SyncMessage } from "../../usecases/message/syncMessage";
import {
  FileEntity,
  GenderEnum,
  Message,
  MessageEntity,
  MessageEnum,
  MessageStatus,
  NewMessage,
} from "../../entities";
import {
  generateClientId,
  isValidHttpUrl,
  mapTypeMessage,
} from "../../utils/utils";
import { UpdateMessage } from "../../usecases/message/updateMessage";
import { ResendPendingMessage } from "../../usecases/message/resendPendingMessage";
import { GetFileUrl } from "../../usecases/message/getFileUrl";
import ConversationController from "../ConversationController/ConversationController";
import { SearchMessageByKeyword } from "../../usecases/message/searchMessageByKeyword";
import EventEmitter from "../../utils/event-emitter";
import { messageConstants } from "../../view/action";
import { standardConversationArray } from "../../repository/conversation/helpers";
import { standardMessageArray } from "../../repository/message/helpers";
import { EncryptMessage } from "../../usecases/message/encryptMessage";
import { DecryptMessage } from "../../usecases/message/decryptMessage";
import { addTotalMessage } from "../../services/redux/states/message/message.action";
import {
  addConversation,
  selectConversation,
  updateLastMessage,
} from "../../services/redux/states/conversation/conversation.action";
import eventEmitter from "../../utils/event-emitter";

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
  private _encryptMessageUseCase: EncryptMessage;
  private _decryptMessageUseCase: DecryptMessage;

  private syncAttemp = 0;

  private _messageQueue: MessageEntity[];
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
    this._encryptMessageUseCase = new EncryptMessage(this._messageRepo);
    this._decryptMessageUseCase = new DecryptMessage(this._messageRepo);

    this._messageQueue = [];

    eventEmitter.addListener(
      messageConstants.RECEIVE_MESSAGE,
      this.receiveMessage
    );
  }

  syncMessage() {
    this._syncMessageUseCase
      .execute()
      .then((data) => {
        if (this.syncAttemp === 0) {
          // this._resendPendingMessageUseCase
          //   .execute()
          //   .then((data) => this.getAllMesssageFromConversation())
          //   .catch(console.log);
        }
        if (data) {
          this.getMesssageFromConversation();
          this.syncAttemp++;
        }
        eventEmitter.emit(messageConstants.SYNC_MESSAGE);
      })
      .catch((err) => {
        //if user's network still good but axios network error -> server down -> logout
        console.log(err);
        eventEmitter.emit(messageConstants.SYNC_MESSAGE);
      });
  }
  async getMesssageFromConversation() {
    try {
      if (this._getState().message.selected) {
        this.loadToMessage(this._getState().message.selected);
      } else {
        const data = await this._getMessageFromConversationUseCase.execute(
          this._getState().conversation.selected,
          Date.now()
        );

        const messages = Helper.conversationModelToEntity(data);
        this._dispatch(setMessage(messages));
      }
    } catch (err) {
      //if user's network still good but axios network error -> server down -> logout
      console.log(err);
    }
  }
  async loadToMessage(currentMessage: MessageEntity) {
    try {
      const data = await this._getMessageFromConversationUseCase.execute(
        this._getState().conversation.selected,
        Date.now(),
        currentMessage.create_at
      );
      this._dispatch(setMessage(Helper.conversationModelToEntity(data)));
      await this.loadMoreMessageFromConversation(data[0].getCreateAt());
    } catch (err) {
      //if user's network still good but axios network error -> server down -> logout
      console.log(err);
    }
  }
  async loadMoreMessageFromConversation(from: number) {
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

  enqueueMessage = async (message: MessageEntity) => {
    console.log("ENQUEUE", message);
    //update conversation
    // this._dispatch(updateLastMessage(comessage))
    // message = await this.encryptMessage(message);
    // console.log("ENCRYPTED MESSAGE", message);
    this._messageQueue.push(message);
    if (this._messageQueue.length === 1) this.sendMessage();
  };

  private _sending = false;

  sendMessage = async () => {
    if (!this._sending) {
      let nextMessage = this._messageQueue.shift();
      if (nextMessage) {
        this._sending = true;
        try {
          console.log("SEND", nextMessage);
          await this._addMessageUseCase.execute(nextMessage);
        } catch (err) {
          console.log(err);
          nextMessage.status = MessageStatus.ERROR;
          nextMessage.id = nextMessage.clientId;
          this.updateMessage(nextMessage, true);
          this._sending = false;
        }
      }
    }
  };

  getConversationFromMessage = async (conversationId: string) => {
    try {
      //get conver from state manager
      const conver =
        ConversationController.getInstance().findConversation(conversationId);
      if (conver) return conver;
      else {
        //get conver from source
      }
    } catch (err) {
      return null;
    }
  };

  createTempMessage = (newMessage: NewMessage, to: string[]) => {
    try {
      let newMessageEntity;
      if (to.length > 1)
        newMessageEntity = Helper.newMessageToMessageEntity(
          newMessage,
          "g" + newMessage.conversation_id
        );
      else
        newMessageEntity = Helper.newMessageToMessageEntity(newMessage, to[0]);

      this._dispatch(addMessage(newMessageEntity));

      //update conversation last message
      ConversationController.getInstance().updateNewMessage(newMessageEntity);
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
  updateMessage = async (updatedMessage: MessageEntity, sentUpdate = false) => {
    console.log("UPDATE MESSAGE", updatedMessage, sentUpdate);

    if (sentUpdate) {
      //trigger queue to continue send message
      this._sending = false;
      this.sendMessage();

      if (
        updatedMessage.sender === this._getState().auth.user &&
        this._getState().conversation.selected === ""
      ) {
        ConversationController.getInstance().select(
          updatedMessage.conversation_id!
        );
      }

      this._dispatch(updateSentMessage(updatedMessage));

      const { messages } = this._getState().message;
      const sentMessage: MessageEntity = {
        ...messages.find(
          (msg: MessageEntity) => msg.clientId === updatedMessage.clientId
        ),
      };
      this._addMessageUseCase.execute(sentMessage).catch((err) => {
        console.log(err);
      });
    } else {
      this._dispatch(updateMessage(updatedMessage));
      this._updateMessageUseCase
        .execute(updatedMessage)
        .then((data) => {})
        .catch((err) => {
          //if user's network still good but axios network error -> server down -> logout
          console.log(err);
        });
    }
  };

  // encryptMessage = async (message: MessageEntity) => {
  //   console.log("=================ENCRYPTING===================");
  //   console.log("MESSAGE TO ENCRYTP", message);
  //   try {
  //     if (!message.to) {
  //       throw new Error("No message receiver (to)");
  //     }
  //     let isGroup = `${message.to}` === `g${message.conversation_id}`;
  //     console.log(
  //       "isGROUP",
  //       isGroup,
  //       `${message.to}`,
  //       `g${message.conversation_id}`
  //     );
  //     //encryptmessage
  //     if (!isGroup) {
  //       return await this._encryptMessageUseCase.execute(
  //         Helper.cloneMessage(message)
  //       );
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     message.status = MessageStatus.ERROR;
  //   }
  //   console.log("=================ENCRYPTING===================");
  //   return message;
  // };

  // decryptMessage = async (message: MessageEntity) => {
  //   console.log("=============== START DECRYPT ========================");
  //   let isGroup = `${message.to}` === `g${message.conversation_id}`;
  //   console.log("MESSAGE TO DECRYPT", message.content, isGroup);
  //   if (!isGroup) {
  //     message = await this._decryptMessageUseCase.execute(
  //       message,
  //       this._getState().auth.user
  //     );
  //   }
  //   console.log("AFTER DECRYPT", message.content);
  //   console.log("================ END DECRYPT ========================");

  //   return message;
  // };

  resendMessage = (message: MessageEntity) => {
    const resendMessage = { ...message };
    this._dispatch(deleteMessage(message.id || message.clientId!));
    resendMessage.status = MessageStatus.SENDING;
    resendMessage.create_at = Date.now();
    console.log("ADD NEW");
    this._dispatch(addMessage(resendMessage));
    this.enqueueMessage(resendMessage);
  };

  receiveMessage = async (message: MessageEntity) => {
    console.log("RECEIVE MESSAGE", message);
    if (message.conversation_id === this._getState().conversation.selected) {
      this._dispatch(addMessage(message));
    }
  };

  //search message
  searchMessage = async (keyword: string, offset?: number) => {
    try {
      const messages = await this._searchMessageByKeywordUseCase.execute(
        keyword,
        offset || 0
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
    eventEmitter.removeAllListeners();
  }

  static getInstance = (): MessageController => {
    if (this._instance == null) {
      this._instance = new MessageController();
    }
    return this._instance;
  };
}
