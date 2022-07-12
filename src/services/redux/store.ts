import { configureStore, Store } from "@reduxjs/toolkit";
import authReducer from "./states/auth/auth.reducer";
import conversationReducer from "./states/conversation/conversation.reducer";
import messageReducer from "./states/message/message.reducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    message: messageReducer,
    conversation: conversationReducer,
  },
});

export const observeStore = <T>(
  select: (state: RootState) => T,
  onChange: (change: T) => void,
  myStore: Store = store
) => {
  let currentState: T;

  function handleChange() {
    let nextState = select(myStore.getState());
    if (nextState !== currentState) {
      currentState = nextState;
      onChange(currentState);
    }
  }

  let unsubscribe = myStore.subscribe(handleChange);
  handleChange();
  return unsubscribe;
};

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
