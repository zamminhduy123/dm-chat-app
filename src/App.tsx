import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Route, Redirect, Switch, HashRouter } from "react-router-dom";
import { LocalStorage } from "./storage";
import eventEmitter from "./utils/event-emitter";
import { userConstants } from "./view/action";
import { useTheme } from "./view/adapter/useTheme";
import FallbackUI from "./view/components/FallBackUI/FallBackUI";
import Modal from "./view/components/Modal/Modal";
import NewKeyAlert from "./view/components/NewKeyAlert/NewKeyAlert";
import PrivateRoute from "./view/components/PrivateRoute/PrivateRoute";
import { Login, Register } from "./view/pages/Account";
import Main from "./view/pages/Main";

export default function App(props: any) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [newKeyAlert, setNewKeyAlert] = React.useState(false);
  React.useEffect(() => {
    const newKeyCreatedListener = eventEmitter.addListener(
      userConstants.CREATE_NEW_KEY,
      () => {
        setNewKeyAlert(true);
      }
    );

    LocalStorage.getInstance()
      .getLocalStorage()
      .then((local) => {
        if (!local.getItem("login")) {
          setNewKeyAlert(true);
          local.setItem("login", "1");
        }
      });
    return () => newKeyCreatedListener.remove();
  }, []);

  return (
    <>
      <Modal
        title={t("New key generated")}
        isOpen={newKeyAlert}
        hasBackdrop
        handleClose={() => {
          setNewKeyAlert(false);
        }}
      >
        <NewKeyAlert />
      </Modal>
      <HashRouter>
        <Suspense fallback={<FallbackUI />}>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <PrivateRoute>
              <Route path="/" component={Main} exact />
            </PrivateRoute>
            <Redirect from="*" to="/" />
          </Switch>
        </Suspense>
      </HashRouter>
    </>
  );
}
