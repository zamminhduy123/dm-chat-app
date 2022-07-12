import React from "react";
import Button from "../../../components/UI/Button/Button";
import { Link } from "react-router-dom";
import Avatar from "../../../components/Avatar/Avatar";

import StrengthBar from "../../../components/UI/StrengthBar/StrengthBar";

import { RegisterViewModel as useViewModel } from "./RegisterViewModel";
import Notification from "../../../components/UI/Notification/Notification";

import logo from "../../../../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import default_image from "../../../../assets/default-avatar.png";
import useTranslation from "../../../adapter/translation.adapter";
import LanguageChange from "../../../components/LanguageChange/LanguageChange";

interface RegisterProps {}

const Register: React.FunctionComponent = (props: RegisterProps) => {
  const {
    formPage,
    setFormPage,
    inputPassword,
    retypePassword,
    passwordStrength,
    onSubmit,
    handleSubmit,
    getPasswordMessage,
    isPasswordMatch,
    register,
    imageInput,
    imageSelected,
    watch,
    notification,
    errors,
    avatar,
    setAvatar,
  } = useViewModel();
  const { t } = useTranslation();

  return (
    <>
      <div
        className="form flex-center"
        style={{ width: "320px", height: "100%" }}
      >
        <div className="form-panel">
          {formPage === 0 ? (
            <div className="form-header">
              <Avatar src={logo} style="normal" />
              <h1>
                {t("Sign up")}
                <br />
              </h1>
              <h5
                style={{ fontStyle: "normal", color: "var(--color-primary)" }}
              >
                {t("Becoming a member of") + " " + t("DM Platform")}
              </h5>
            </div>
          ) : null}
          <div className="form-content">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div
                className="elementToSlideOutRight"
                style={{ display: `${formPage === 1 ? "none" : "block"}` }}
              >
                <div className="form-group">
                  <label htmlFor="username">{t("username")}</label>
                  <input
                    className={errors.username ? "error-border" : ""}
                    type="text"
                    {...register("username", {
                      required: t("Username is required").toString(),
                      pattern: {
                        value: /^[a-zA-Z0-9]/,
                        message: t(
                          "Username must contains only text and number"
                        ),
                      },
                      minLength: {
                        value: 6,
                        message: t("At least 6 character"),
                      },
                      maxLength: 18,
                    })}
                    placeholder={
                      t("Type your") + " " + t("username").toLowerCase()
                    }
                  />
                  <p className="error-message">{errors.username?.message}</p>
                </div>
                <div
                  className="form-group"
                  style={{
                    marginBottom: `${
                      inputPassword.length > 0 ? "4px" : "15px"
                    }`,
                  }}
                >
                  <label htmlFor="password">{t("password")}</label>
                  <input
                    placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                    className={errors.password ? "error-border" : ""}
                    type="password"
                    {...register("password", {
                      required: t("Password is required").toString(),
                    })}
                  />
                  <StrengthBar
                    length={inputPassword.length}
                    dataStrength={passwordStrength.id}
                    message={getPasswordMessage(
                      passwordStrength.contains,
                      passwordStrength.length
                    )}
                    strength={t(passwordStrength.value)}
                  />
                  <p className="error-message">{errors.password?.message}</p>
                </div>
                <div className="form-group">
                  <label htmlFor="retypePassword">
                    {t("retype") + " " + t("password")}
                  </label>
                  <input
                    placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                    className={
                      errors.retypePassword || !isPasswordMatch()
                        ? "error-border"
                        : ""
                    }
                    type="password"
                    {...register("retypePassword", {
                      required: t("This field is required").toString(),
                    })}
                  />
                  <p className="error-message ">
                    {!isPasswordMatch()
                      ? t("Password not match")
                      : errors.retypePassword?.message}
                  </p>
                </div>

                <div
                  className="form-group form-submit-button"
                  style={{ alignItems: "end" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => {
                      setFormPage(1);
                    }}
                    endIcon={
                      <FontAwesomeIcon
                        style={{ color: "white", marginLeft: "4px" }}
                        icon={faAngleRight}
                      />
                    }
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>

              <div
                className="elementToSlideOutRight"
                style={{ display: `${formPage === 0 ? "none" : "block"}` }}
              >
                <div className="form-group">
                  <div
                    id="profile"
                    className={"hasImage"}
                    style={{
                      backgroundImage: `url(${
                        avatar ? avatar : default_image
                      })`,
                    }}
                  >
                    <input
                      key={avatar || ""}
                      ref={imageInput}
                      type="file"
                      id="actual-btn"
                      hidden
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={imageSelected}
                    />
                    <div
                      className="dashes"
                      onClick={() => {
                        imageInput.current?.click();
                      }}
                    ></div>
                    <p>{t("Click to add avatar")}</p>
                    <div className="delete-avatar">
                      <FontAwesomeIcon
                        onClick={() => {
                          setAvatar("");
                        }}
                        color="inherit"
                        icon={faCircleXmark}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="name">{t("name")}</label>
                  <input
                    className={errors.name ? "error-border" : ""}
                    type="text"
                    {...register("name", {
                      required: t("Name is required").toString(),
                      maxLength: 50,
                    })}
                    placeholder={t("Type your") + " " + t("name").toLowerCase()}
                  />
                  <p className="error-message">{errors.name?.message}</p>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{t("Phone")}</label>
                  <input
                    className={errors.phone ? "error-border" : ""}
                    type="tel"
                    maxLength={11}
                    {...register("phone", {
                      required: t("Phone is required").toString(),
                      pattern: {
                        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
                        message: t("Invalid phone number"),
                      },
                      minLength: {
                        value: 9,
                        message: t("At least 9 number"),
                      },
                      maxLength: 11,
                    })}
                  />
                  <p className="error-message">{errors.phone?.message}</p>
                </div>
                <div className="form-group">
                  <label htmlFor="gender">{t("Gender")}</label>
                  <select {...register("gender")}>
                    <option value="0">{t("Male")}</option>
                    <option value="1">{t("Female")}</option>
                    <option value="2">{t("Other")}</option>
                  </select>
                  {errors.phone ? <div></div> : null}
                </div>

                {notification.message && notification.type != "loading" ? (
                  <Notification
                    variant="contained"
                    type={notification.type}
                    message={notification.message}
                  />
                ) : null}
                <div className="form-group-double">
                  <div className="form-group form-submit-button">
                    <Button
                      variant="contained"
                      color="info"
                      size="large"
                      onClick={() => setFormPage(0)}
                      startIcon={
                        <FontAwesomeIcon
                          style={{ color: "white", marginRight: "4px" }}
                          icon={faAngleLeft}
                        />
                      }
                    >
                      {t("Back")}
                    </Button>
                  </div>
                  <div
                    className="form-group form-submit-button"
                    style={{ alignItems: "end" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      type="submit"
                      isLoading={
                        notification.message.length > 0 &&
                        notification.type === "loading"
                      }
                    >
                      {t("Register")}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="dots" style={{ marginBottom: "10px" }}>
            <div
              className={`dot ${formPage === 0 ? " active" : ""}`}
              style={{ marginRight: "5px" }}
            ></div>
            <div className={`dot ${formPage === 1 ? " active" : ""}`}></div>
          </div>
          <div className="form-footer">
            <h4>{t("Already has an account")}?&nbsp;</h4>
            <Link to="/login">
              <span className="register">{t("Login")}</span>
            </Link>
          </div>
          <LanguageChange />
        </div>
      </div>
    </>
  );
};

export default Register;
