import React from "react";
import useTranslation from "../../adapter/translation.adapter";

import "./WelcomePage.scss";

import welcomeURL from "../../../assets/welcome.png";
import FileMessage from "../../pages/Main/ChatSection/Message/FileMessage";

export interface WelcomePageProps {}

const WelcomePage = (props: WelcomePageProps) => {
  const { t } = useTranslation();
  return (
    <div id="welcome-onboard">
      <div className="welcome-container">
        <div className="welcome-header">
          <div className="welcome-header-title">
            <span>{t("Welcome to")}&nbsp;</span>
            <span style={{ fontWeight: "600" }}>DM!</span>
          </div>
          <span style={{ fontFamily: "inherit", fontSize: "14px" }}>
            {t(
              "Explore the best features to support your work and allow you to chat with your friends and family. All are optimized for your computer!"
            )}
          </span>
        </div>
        <div className="welcome-body">
          <div className="welcome-image">
            <img src={welcomeURL} />
          </div>
          <div className="welcome-body-title">
            <span className="title">{t("Messages more, work less")}</span>
            <span className="subtitle">
              {t("Use")} <strong>{t("Quick message")}</strong>
              {t(
                "to save common messages & respond faster in any conversations"
              )}
              .
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WelcomePage;
