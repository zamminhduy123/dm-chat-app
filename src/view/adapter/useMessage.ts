import React from "react";
import { MessageEntity } from "../../entities";
import { observeStore, store } from "../../services/redux";
import { IMessage } from "../../services/redux/interfaces";

export function useMessage(): IMessage {
  const { messages, hasMore } = store.getState().message;
  //force update
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  React.useEffect(() => {
    let unsubscribe = observeStore<IMessage>(
      (state) => state.message,
      forceUpdate
    );
    return () => {
      unsubscribe();
    };
  }, []);
  return { messages, hasMore };
}
