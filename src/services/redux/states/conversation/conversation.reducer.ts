import { PayloadAction } from "@reduxjs/toolkit";
import {
  ConversationEntity,
  FileEntity,
  MessageEntity,
  MessageEnum,
} from "../../../../entities";
import {
  mapMessageType,
  mapTypeMessage,
  updateObject,
} from "../../../../utils/utils";
import { conversationConstants } from "../../../../view/action";
import { IConversation } from "../../interfaces/IConversation";
import { Action } from "../../type";

const initialState: IConversation = {
  conversations: [],
  selected: "",
  atMsg: null,
};

const reset = (state = initialState, action: Action) => {
  return { ...initialState };
};

const setConversation = (state = initialState, action: Action) => {
  // console.log(action.payload);
  return updateObject(state, action.payload);
};

const addConversation = (state = initialState, action: Action) => {
  // console.log(action.payload, state.selected);
  // if (
  //   action.payload.lastMessage &&
  //   action.payload.lastMessage.sender === state.selected
  // ) {
  //   return updateNewConversation(state, action);
  // }
  const newConversationList = [action.payload, ...state.conversations];

  return updateObject(state, {
    conversations: newConversationList,
  });
};

const addTotalMessage = (state = initialState, action: Action) => {
  const currentConversation = state.conversations.findIndex(
    (conv) => conv.id === state.selected
  );
  if (currentConversation) {
    const updatedCurrentConversation = {
      ...state.conversations[currentConversation],
      lastMessage: state.conversations[currentConversation].lastMessage && {
        ...state.conversations[currentConversation].lastMessage,
      },
    };
    updatedCurrentConversation.totalMessage += 1;
    return updateObject(state, {
      conversations: [
        updatedCurrentConversation,
        ...state.conversations.filter(
          (conv) => conv.id !== updatedCurrentConversation.id
        ),
      ],
    });
  }

  return state;
};

const updateConversation = (state = initialState, action: Action) => {
  const indexU = state.conversations.findIndex(
    (c) => c.id === action.payload.id
  );
  // const updatedConversation = {
  //   ...state.conversations[indexU],
  //   ...action.payload,
  //   lastMessage: state.conversations[indexU].lastMessage
  //     ? {
  //         ...state.conversations[indexU].lastMessage,
  //         ...action.payload.lastMessage,
  //         content: mapMessageType(+action.payload.lastMessage.type),
  //         // typeof action.payload.lastMessage.content === "string"
  //         //   ? action.payload.lastMessage.content
  //         //   : ,
  //       }
  //     : action.payload.lastMessage,
  // };
  if (indexU === -1) {
    return addConversation(state, action);
  }
  return {
    ...state,
    ...{
      conversations: [
        ...state.conversations.slice(0, indexU),
        action.payload,
        ...state.conversations.slice(indexU + 1),
      ],
    },
  };
};

const updateLastMessage = (state = initialState, action: Action) => {
  const needUpdateConversation = state.conversations.findIndex(
    (conver) => conver.id === state.selected
  );

  const newMessage = action.payload as MessageEntity;

  if (needUpdateConversation >= 0) {
    let newConversationList = state.conversations;
    const updatedConversation = {
      ...state.conversations[needUpdateConversation],
    };
    updatedConversation.lastMessage = {
      ...newMessage,
      content:
        +newMessage.type === MessageEnum.text
          ? newMessage.content
          : { ...(newMessage.content as FileEntity) },
    };

    newConversationList = [
      ...state.conversations.filter((item) => item.id !== state.selected),
    ];
    newConversationList.unshift(updatedConversation);

    return updateObject(state, { conversations: newConversationList });
  }

  //find the conversation

  return state;
};

const updateNewConversation = (state = initialState, action: Action) => {
  const newConversationIndex = state.conversations.findIndex(
    (conver) => state.selected === conver.id
  );

  if (newConversationIndex >= 0) {
    let newConversationList = state.conversations;
    const updatedConversation = {
      ...action.payload,
    };
    newConversationList = [
      ...state.conversations.filter((item) => item.id !== state.selected),
    ];
    newConversationList.unshift(updatedConversation);
    return updateObject(state, {
      conversations: newConversationList,
      selected: updatedConversation.id,
    });
  }

  // if (needUpdateConversation) {
  //   let newConversationList = state.conversations;
  //   const updatedConversation = { ...needUpdateConversation };
  //   updatedConversation.lastMessage = { ...action.payload.lastMessage };
  //   if (needUpdateConversation.id) {
  //     newConversationList = [
  //       ...state.conversations.filter((item) => item.id != action.payload.id),
  //     ];
  //     newConversationList.unshift(updatedConversation);
  //   }
  //   console.log(newConversationList);
  //   return updateObject(state, { conversations: newConversationList });
  // }

  //find the conversation

  return state;
};

const reducer = (state = initialState, action: Action) => {
  console.log(state.selected);
  switch (action.type) {
    case conversationConstants.SELECT_CONVERSATION:
      return setConversation(state, action);
    case conversationConstants.SET_CONVERSATION:
      return setConversation(state, action);
    case conversationConstants.ADD_CONVERSATION:
      return addConversation(state, action);
    case conversationConstants.ADD_TOTAL_MESSAGE:
      return addTotalMessage(state, action);
    case conversationConstants.UPDATE_CONVERSATION:
      return updateConversation(state, action);
    case conversationConstants.UPDATE_LAST_MESSAGE:
      return updateLastMessage(state, action);
    case "RESET":
      return reset(state, action);
    default:
      return state;
  }
};
export default reducer;
