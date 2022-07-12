import React from "react";
import { ConversationEntity } from "../../entities";
import { observeStore, store } from "../../services/redux";
import { IConversation } from "../../services/redux/interfaces";

export const useConversation = (): ConversationEntity[] => {
  const { conversations } = store.getState().conversation;
  //force update
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  React.useEffect(() => {
    let unsubscribe = observeStore<IConversation>(
      (state) => state.conversation,
      forceUpdate
    );
    return () => {
      unsubscribe();
    };
  }, []);
  return conversations;
};
