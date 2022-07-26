import { MessageEntity } from "../../../../entities";
import { messageConstants } from "../../../../view/action";

export const setMessage = (messageList: MessageEntity[]) => {
  console.log(messageList);
  return {
    type: messageConstants.SET_MESSAGE,
    payload: {
      messages: messageList,
    },
  };
};
export const setTotalMessage = (total: number) => {
  return {
    type: messageConstants.SET_TOTAL_MESSAGE,
    payload: {
      totalMessage: total,
    },
  };
};
export const addTotalMessage = () => {
  return {
    type: messageConstants.ADD_TOTAL_MESSAGE,
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

export const deleteMessage = (identifier: string) => {
  console.log("DELETE", {
    type: messageConstants.DELETE_MESSAGE,
    payload: identifier,
  });
  return {
    type: messageConstants.DELETE_MESSAGE,
    payload: identifier,
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
