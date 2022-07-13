import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Route, Redirect, Switch, HashRouter } from "react-router-dom";
import { useTheme } from "./view/adapter/useTheme";
import FallbackUI from "./view/components/FallBackUI/FallBackUI";
import PrivateRoute from "./view/components/PrivateRoute/PrivateRoute";
import { Login, Register } from "./view/pages/Account";
import Main from "./view/pages/Main";

export default function App(props: any) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
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
  );
}
