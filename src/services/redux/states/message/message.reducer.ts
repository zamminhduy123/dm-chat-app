import { FileEntity, MessageEntity, MessageEnum } from "../../../../entities";
import { updateObject } from "../../../../utils/utils";
import { messageConstants } from "../../../../view/action";
import { IMessage } from "../../interfaces";
import { Action } from "../../type";

const initialState: IMessage = {
  messages: [],
  hasMore: true,
  selected: undefined,
};
const setMessages = (state = initialState, action: Action) => {
  return updateObject(state, { ...action.payload });
};

const loadMoreMessages = (state = initialState, action: Action) => {
  if (action.payload.messages.length) {
    const messageList = state.messages;
    const newMessageList = [...action.payload.messages, ...messageList];
    return updateObject(state, {
      messages: newMessageList,
      hasMore: true,
    });
  } else {
    return updateObject(state, {
      hasMore: false,
    });
  }
};

const addMessage = (state = initialState, action: Action) => {
  const messageList = state.messages;

  const newMessageList = [...messageList, { ...action.payload }];
  // console.log(newMessageList);
  return updateObject(state, {
    messages: [...newMessageList],
    selected: undefined,
  });
};

const updateSentMessage = (state = initialState, action: Action) => {
  const indexU = state.messages.findIndex(
    (m) => m.clientId === action.payload.clientId
  );

  if (indexU >= 0) {
    if (state.messages[indexU].status === 2) {
      action.payload.status = 2;
    }

    const updatedMessage = {
      content:
        typeof state.messages[indexU].content === "string"
          ? state.messages[indexU].content
          : {
              ...(state.messages[indexU].content as FileEntity),
              ...action.payload.content,
            },
      id: action.payload.id,
      create_at: action.payload.create_at,
      status: action.payload.status,
    };
    const newList = [...state.messages];
    newList[indexU] = { ...newList[indexU], ...updatedMessage };
    return updateObject(state, {
      messages: newList,
    });
  }
  return state;
};

const updateMessage = (state = initialState, action: Action) => {
  const indexU = state.messages.findIndex((m) => {
    if (m.id && action.payload.id) {
      return m.id === action.payload.id;
    } else {
      return m.clientId === action.payload.clientId;
    }
  });
  // console.log(action.payload, indexU);
  if (indexU >= 0) {
    const updatedMessage = {
      status: action.payload.status,
    };
    const newList = [...state.messages];
    newList[indexU] = { ...newList[indexU], ...updatedMessage };
    return updateObject(state, {
      messages: newList,
    });
  } else {
    return state;
  }
};

const selectMessage = (state = initialState, action: Action) => {
  return updateObject(state, {
    selected: action.payload.selected,
  });
};
const reset = (state = initialState, action: Action) => {
  return { ...initialState };
};

const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case messageConstants.SET_MESSAGE:
      return setMessages(state, action);
    case messageConstants.ADD_MESSAGE:
      return addMessage(state, action);
    case messageConstants.SELECT_MESSAGE:
      return selectMessage(state, action);
    case messageConstants.LOAD_MORE:
      return loadMoreMessages(state, action);
    case messageConstants.UPDATE_MESSAGE_WITH_CLIENTID:
      return updateSentMessage(state, action);
    case messageConstants.UPDATE_MESSAGE_WITH_ID:
      return updateMessage(state, action);
    case "RESET":
      return reset(state, action);
    default:
      return state;
  }
};
export default reducer;
