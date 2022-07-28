import { ConversationEntity, MessageEntity } from "../../../../entities";
import { conversationConstants } from "../../../../view/action";

export const selectConversation = (conversation_id: string) => {
  return {
    type: conversationConstants.SELECT_CONVERSATION,
    payload: {
      selected: conversation_id,
    },
  };
};

export const setConversation = (conversationList: ConversationEntity[]) => {
  return {
    type: conversationConstants.SET_CONVERSATION,
    payload: {
      conversations: conversationList,
    },
  };
};

export const addTotalMessage = () => {
  return {
    type: conversationConstants.ADD_TOTAL_MESSAGE,
  };
};

export const addConversation = (newConver: ConversationEntity) => {
  return {
    type: conversationConstants.ADD_CONVERSATION,
    payload: newConver,
  };
};

export const updateConversation = (updatedConver: ConversationEntity) => {
  // console.log("HALO", updatedConver.lastMessage?.type.toString());
  return {
    type: conversationConstants.UPDATE_CONVERSATION,
    payload: updatedConver,
  };
};

export const updateLastMessage = (message: MessageEntity) => {
  return {
    type: conversationConstants.UPDATE_LAST_MESSAGE,
    payload: message,
  };
};
