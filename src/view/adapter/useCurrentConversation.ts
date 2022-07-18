import React from "react";
import { observeStore, store } from "../../services/redux";
import { IConversation } from "../../services/redux/interfaces";

export function useCurrentConversation() {
  const { selected } = store.getState().conversation;
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
  // console.log(selected);
  return { selected };
}
