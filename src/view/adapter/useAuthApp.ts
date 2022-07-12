import React from "react";
import { UserController } from "../../controller";
import { store, observeStore, RootState } from "../../services/redux";

const useAuthApp = () => {
  const auth = store.getState().auth;
  //force update
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  React.useEffect(() => {
    let unsubscribe = observeStore(
      (state: RootState) => state.auth,
      forceUpdate
    );
    return () => {
      unsubscribe();
    };
  }, []);
  return auth;
};
export default useAuthApp;
