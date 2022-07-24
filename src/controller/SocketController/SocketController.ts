import { BaseController } from "../BaseController";
import {
  addMessage,
  updateMessage,
  updateSentMessage,
} from "../../services/redux/states/message/message.action";

import { Typing } from "../../entities/type";
import { Socket } from "../../services/socket";
import { ConversationEntity, MessageEntity, MessageEnum } from "../../entities";
import {
  conversationConstants,
  messageConstants,
  userConstants,
} from "../../view/action";
import { updateLastMessage } from "../../services/redux/states/conversation/conversation.action";
import ConversationController from "../ConversationController/ConversationController";
import db from "../../storage/storageAdapter";
import MessageController from "../MessageController/MessageController";
import UserController from "../UserController/UserController";
import { parseContent } from "./helper";
import { TypingData } from "../../entities/type/TypingData";
import { NewKey } from "../../entities/type/NewKey";

export default class SocketController extends BaseController {
  private static _instance: SocketController | null = null;
  constructor() {
    super();
  }
  init = () => {
    const { user } = this._getState().auth;
    Socket.getInstance().setUser(user);
    try {
      Socket.getInstance().registerConnectSuccess(this.registerListener);
      Socket.getInstance().connect();
      console.log("SOCKET ESTABLISH")
    } catch (err) {
      console.log("Socket connect error", err);
    }
  };

  connectError = (cb: Function) => {
    Socket.getInstance().registerConnectError((err) => {
      console.error("Connect Error: ", err.message);
      cb();
    });
  };
  connectSuccess = (cb: () => void) => {
    Socket.getInstance().registerConnectSuccess(cb);
  };

  reconnectFail = (cb: () => void) => {
    Socket.getInstance().reconnectFailed(() => {
      cb();
    });
  };

  static destroy() {
    this._instance = null;
    Socket._instance = null;
  }

  private registerListener = () => {
    this.conversationUpdate();
    this.receiveMessage();
    this.messageSent();
    this.typingRegister();
    this.errorListener();
    this.receiveNewKey();

    console.log("RESYNC");

    ConversationController.getInstance().syncConversations();
    MessageController.getInstance().syncMessage();
  };

  messageSent = () => {
    Socket.getInstance().removeRegisteredListener(
      messageConstants.MESSAGE_SENT
    );
    Socket.getInstance().removeRegisteredListener(
      messageConstants.MESSAGE_SENT_RECEIVED
    );

    const messageSentHandler = (data: MessageEntity) => {
      parseContent(data);
      MessageController.getInstance().updateMessage(data, true);
    };
    const messageUpdateHandler = (data: MessageEntity) => {
      parseContent(data);
      MessageController.getInstance().updateMessage(data);
    };

    Socket.getInstance().registerListener<MessageEntity>(
      messageConstants.MESSAGE_SENT,
      messageSentHandler
    );
    Socket.getInstance().registerListener<MessageEntity>(
      messageConstants.MESSAGE_SENT_RECEIVED,
      messageUpdateHandler
    );
  };

  typingSend = () => {
    Socket.getInstance().emit<string>(
      messageConstants.TYPING_SEND,
      this._getState().auth.user
    );
  };

  typingReceive = (callback: Function) => {
    Socket.getInstance().removeRegisteredListener(
      messageConstants.TYPING_RECEIVE
    );
    Socket.getInstance().registerListener<TypingData>(
      messageConstants.TYPING_RECEIVE,
      (data: TypingData) => {
        console.log(data);
        if (this._getState().conversation.selected === data.conversation_id) {
          callback(data.senderName);
        }
      }
    );
  };

  private _cached_conversation_id: string | undefined;
  typingRegister = (conversation_id?: string) => {
    if (conversation_id) {
      if (
        !this._cached_conversation_id ||
        this._cached_conversation_id != conversation_id
      ) {
        this._cached_conversation_id = conversation_id;
        Socket.getInstance().emit<Typing>(messageConstants.TYPING_REGISTER, {
          conversation_id: conversation_id,
          sender: this._getState().auth.user,
        });
      }
    } else {
      this._cached_conversation_id &&
        Socket.getInstance().emit<Typing>(messageConstants.TYPING_REGISTER, {
          conversation_id: this._cached_conversation_id,
          sender: this._getState().auth.user,
        });
    }
  };

  conversationUpdate = () => {
    Socket.getInstance().removeRegisteredListener(
      conversationConstants.CONVERSATION_CHANGE
    );
    Socket.getInstance().registerListener<ConversationEntity>(
      conversationConstants.CONVERSATION_CHANGE,
      async (data) => {
        const existed = ConversationController.getInstance().findConversation(
          data.id
        );
        parseContent(data.lastMessage);
        if (
          data.lastMessage &&
          data.users.length === 2 &&
          +data.lastMessage.type === MessageEnum.text
        )
          data.lastMessage =
            (await MessageController.getInstance().decryptMessage(
              data.lastMessage
            )) || null;
        //emit new notification for window
        if (
          window.electronAPI &&
          this._getState().auth.user !== data.lastMessage?.sender
        )
          window.electronAPI.notification.newNotification(
            data.users.filter((u) => u.username === data.lastMessage?.sender)[0]
              .name || "New message",
            data.lastMessage?.content
          );
        if (!existed) {
          ConversationController.getInstance().addNewConversation(data);
        } else {
          ConversationController.getInstance().updateConversation(data);
        }
      }
    );
  };

  receiveMessage = () => {
    Socket.getInstance().removeRegisteredListener(
      messageConstants.RECEIVE_MESSAGE
    );
    Socket.getInstance().registerListener<MessageEntity>(
      messageConstants.RECEIVE_MESSAGE,
      (data) => {
        // console.log("RECEIVED", data, data.content);
        parseContent(data);
        // console.log("RECEIVED", data, data.content);
        MessageController.getInstance().receiveMessage(data);

        this.messageReceived(data);
      }
    );
  };

  receiveNewKey = () => {
    Socket.getInstance().removeRegisteredListener(userConstants.NEW_KEY);
    Socket.getInstance().registerListener<NewKey>(
      userConstants.NEW_KEY,
      (data) => {
        console.log("NEW KEY", data);
        UserController.getInstance().saveUserPKey(
          data.username,
          data.publicKey,
          data.deviceKey,
          new Date(data.create_at).getTime()
        );
      }
    );
  };
  messageReceived = (message: MessageEntity) => {
    Socket.getInstance().emit<MessageEntity>(
      messageConstants.NEW_MESSAGE_RECEIVED,
      message
    );
  };

  errorListener() {
    Socket.getInstance().removeRegisteredListener("ERROR");
    Socket.getInstance().registerListener<number>("ERROR", (code) => {
      console.log(code);
      if (code === 409) {
        UserController.getInstance().logout();
      }
    });
  }

  disconnect() {
    Socket.getInstance().disconnect();
  }

  static getInstance = (): SocketController => {
    if (this._instance == null) {
      this._instance = new SocketController();
    }
    return this._instance;
  };
}
