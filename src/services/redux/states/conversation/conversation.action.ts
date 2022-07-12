import { ConversationEntity } from "../../../../entities";
import { conversationConstants } from "../../../../view/action";

export const selectConversation = (
  conversation_id: string,
  atMsgId?: string
) => {
  return {
    type: conversationConstants.SELECT_CONVERSATION,
    payload: {
      selected: conversation_id,
      atMsgId: atMsgId || "",
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

export const updateLastMessage = (updatedConver: ConversationEntity) => {
  return {
    type: conversationConstants.UPDATE_LAST_MESSAGE,
    payload: updatedConver,
  };
};
