import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { UserController } from "../../../../controller";
import { Credential } from "../../../../entities";
import { observeStore, RootState, store } from "../../../../services/redux";
import { IAuth } from "../../../../services/redux/interfaces";
import useTranslation from "../../../adapter/translation.adapter";

type ILoginFromInput = {
  username: string;
  password: string;
};

const initNotification = {
  type: "loading",
  message: "",
};

export const LoginViewModel = () => {
  const { t } = useTranslation();

  const autoLoginInit = {
    type: "loading",
    message: t("Trying to login"),
  };
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ILoginFromInput>();

  const { login, authenticate } = UserController.getInstance();

  const history = useHistory();

  const [notification, setNotification] = React.useState(initNotification);
  const [tryAuthenticate, setTryAuthenticate] = React.useState(autoLoginInit);
  const isMounted = React.useRef(true);

  const getNotification = (state: any) => {
    if (!state) {
      return;
    }
    const { user, loading, error } = state;
    let noti = initNotification;
    if (loading) noti = { type: "loading", message: t("Loading") };
    if (error) {
      noti = { type: "error", message: t(error) };
    }
    if (user) {
      history.push("/");
      noti = { type: "success", message: t("Login Success") };
    }
    if (isMounted.current) {
      setNotification(noti);
    }
  };

  const onSubmit: SubmitHandler<ILoginFromInput> = async ({
    username,
    password,
  }) => {
    setNotification({ type: "loading", message: t("Loading") });
    const credential: Credential = {
      username,
      password,
    };
    login(credential);
  };

  React.useEffect(() => {
    onTryAutoLogin();
    let unsubscribe = observeStore<IAuth>(
      (state) => state.auth,
      getNotification
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  const onTryAutoLogin = () => {
    authenticate().then(() => {
      if (isMounted.current) setTryAuthenticate(initNotification);
    });
  };

  return {
    tryAuthenticate,
    errors,
    notification,
    register,
    handleSubmit,
    onSubmit,
    getNotification,
    t,
    isMounted,
  };
};
