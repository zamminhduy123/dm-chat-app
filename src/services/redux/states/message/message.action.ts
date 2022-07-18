import { MessageEntity } from "../../../../entities";
import { messageConstants } from "../../../../view/action";

export const setMessage = (messageList: MessageEntity[]) => {
  return {
    type: messageConstants.SET_MESSAGE,
    payload: {
      messages: messageList,
    },
  };
};
export const selectMessage = (message?: MessageEntity) => {
  return {
    type: messageConstants.SELECT_MESSAGE,
    payload: {
      selected: message,
    },
  };
};

export const loadMoreMessages = (messageList: MessageEntity[]) => {
  return {
    type: messageConstants.LOAD_MORE,
    payload: {
      messages: messageList,
    },
  };
};

export const addMessage = (newMessage: MessageEntity) => {
  // console.log("ADD", newMessage);
  return {
    type: messageConstants.ADD_MESSAGE,
    payload: newMessage,
  };
};

export const updateSentMessage = (message: MessageEntity) => {
  return {
    type: messageConstants.UPDATE_MESSAGE_WITH_CLIENTID,
    payload: message,
  };
};

export const updateFileSendingProgress = (
  progress: number,
  clientId: string
) => {
  return {
    type: messageConstants.UPDATE_MESSAGE_WITH_CLIENTID,
    payload: {
      progress,
      clientId,
    },
  };
};

export const updateMessage = (message: MessageEntity) => {
  return {
    type: messageConstants.UPDATE_MESSAGE_WITH_ID,
    payload: message,
  };
};
