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
            <span style={{ fontWeight: "600" }}>DirectMessage!</span>
          </div>
          <span style={{ fontFamily: "inherit", fontSize: "14px" }}>
            {t(
              "The messaging app uses end-to-end encryption for maximum message security"
            )}
          </span>
        </div>
        <div className="welcome-body">
          <div className="welcome-image">
            <img src={welcomeURL} alt="welcome-image" />
          </div>
          <div className="welcome-body-title">
            <span className="title">
              {t("All messages in secret chats use end-to-end encryption")}
            </span>
            <span className="subtitle">
              {t(
                "Only you and the recipient can read those messages — nobody else can decipher them, including us here at DirectMessage"
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
