import React from "react";
import { Link } from "react-router-dom";

import newKeyImage from "../../../assets/new-key-alert.png";
import useTranslation from "../../adapter/translation.adapter";
import "./NewKeyAlert.scss";

const NewKeyAlert = () => {
  const { t } = useTranslation();
  return (
    <div className="new-key-alert-container">
      <p>
        {t(
          "We use this key to encrypt message 1-1 to ensure no one can view your message except you and your recipient"
        )}
      </p>
      <span className="search-info">
        *
        {t(
          "Due to security! Message encrypted at other device in the past can not be decrypted here"
        )}
      </span>
      <img style={{ maxWidth: "100%" }} src={newKeyImage} />

      <Link to="#">{t("Learn more")}</Link>
    </div>
  );
};

export default NewKeyAlert;
