import React, { ReactElement, useEffect, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import useAuthApp from "../../adapter/useAuthApp";

interface AuthGuardProps {
  children: ReactElement | ReactElement[];
}

const PrivateRoute = ({ children }: AuthGuardProps) => {
  const { user } = useAuthApp();
  const [previousRoute, setPreviousRoute] = useState("");
  const { pathname } = useLocation();

  useEffect(() => {
    if (!!previousRoute) setPreviousRoute(pathname);
  }, [pathname, previousRoute]);

  if (user) return <>{children}</>;
  else {
    return (
      <Redirect
        to={{
          pathname: "/login",
        }}
      />
    );
  }
};

export default PrivateRoute;
