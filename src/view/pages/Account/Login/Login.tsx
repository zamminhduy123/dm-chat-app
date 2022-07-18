import React, { useEffect } from "react";
import Notification from "../../../components/UI/Notification/Notification";
import Button from "../../../components/UI/Button/Button";
import { Link } from "react-router-dom";
import Avatar from "../../../components/Avatar/Avatar";

import { LoginViewModel as useViewModel } from "./LoginViewModel";
import AutoLogin from "../AutoLogin/AutoLogin";

import logo from "../../../../assets/logo.png";
import LanguageChange from "../../../components/LanguageChange/LanguageChange";

const Login: React.FunctionComponent = (props: any) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    t,
    errors,
    notification,
    tryAuthenticate,
  } = useViewModel();

  if (tryAuthenticate.message) {
    return (
      <AutoLogin
        type={tryAuthenticate.type}
        message={tryAuthenticate.message}
      />
    );
  }
  return (
    <div className="form flex-center">
      <div className="form-panel elementToSlideOutRight">
        <div className="form-header">
          <Avatar src={logo} style="normal" />
          <h1>
            {t("Sign in") + " " + t("to")}
            <br />
            {t("DM Platform")}
          </h1>
        </div>
        <div className="form-content">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label htmlFor="username">{t("username")}</label>
              <input
                type="text"
                {...register("username", {
                  required: t("Username is required").toString(),
                })}
                placeholder={t("Type your") + " " + t("username").toLowerCase()}
              />
              <p className="error-message text-xs">
                {errors.username?.message}
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="password">{t("password")}</label>
              <input
                autoComplete="true"
                type="password"
                {...register("password", {
                  required: t("Password is required").toString(),
                })}
                placeholder={t("Type your") + " " + t("password").toLowerCase()}
              />
              <p className="error-message text-xs">
                {errors.password?.message}
              </p>
            </div>
            <div className="form-group">
              <div className="form-recovery">
                <Link
                  style={{
                    textTransform: "capitalize",
                    color: "var(--color-primary)",
                  }}
                  to="#"
                >
                  {t("forgot") + " " + t("password")}?
                </Link>
              </div>
            </div>
            {notification.message && notification.type != "loading" ? (
              <Notification
                type={notification.type}
                message={notification.message}
                variant="contained"
              />
            ) : null}
            <div className="form-group form-submit-button">
              <Button
                variant="contained"
                color="gradient-primary"
                size="full"
                type="submit"
                isLoading={
                  notification.message.length > 0 &&
                  notification.type === "loading"
                }
              >
                {t("Sign in")}
              </Button>
            </div>
          </form>
        </div>
        <div className="form-footer">
          <h4>{t("New to")} DM?&nbsp;</h4>
          <Link to="/register">
            <h4 className="register">{t("Register")}</h4>
          </Link>
        </div>
        <LanguageChange />
      </div>
    </div>
  );
};

export default Login;
