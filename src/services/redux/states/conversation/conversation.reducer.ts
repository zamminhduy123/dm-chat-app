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
  const newConversationList = [action.payload, ...state.conversations];

  return updateObject(state, {
    conversations: newConversationList,
  });
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
  return {
    ...state,
    ...{
      conversations: [
        action.payload,
        ...state.conversations.slice(0, indexU),
        ...state.conversations.slice(indexU + 1),
      ],
    },
  };
};

const updateLastMessage = (state = initialState, action: Action) => {
  // const needUpdateConversation = state.conversations.find(
  //   (conver) => conver.id == action.payload.id
  // );

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

  return state;
};

const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case conversationConstants.SELECT_CONVERSATION:
      return setConversation(state, action);
    case conversationConstants.SET_CONVERSATION:
      return setConversation(state, action);
    case conversationConstants.ADD_CONVERSATION:
      return addConversation(state, action);
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
