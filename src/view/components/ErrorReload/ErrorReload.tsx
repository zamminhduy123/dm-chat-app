import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./ErrorReload.scss";
import Button from "../UI/Button/Button";
import useTranslation from "../../adapter/translation.adapter";

interface ErrorReloadProps {
  message?: string;
  onClick?: () => void;
}

function ErrorReload({ message, onClick }: ErrorReloadProps) {
  const history = useHistory();
  const { t } = useTranslation();
  return (
    <div className="error-reload">
      <FontAwesomeIcon icon={faTriangleExclamation} />
      <span className="title">{t("Oh snap")}!</span>
      <p>
        {message ? message : t("Something went wrong")}
        <br />
        {t("Please try agian later")}!
      </p>
      <div style={{ minHeight: "40px", margin: "4px 0px" }}>
        <Button
          size="full"
          onClick={() => {
            window.location.reload();
            onClick && onClick();
          }}
          color={"danger"}
          variant={"contained"}
        >
          Reload
        </Button>
      </div>
    </div>
  );
}

export default ErrorReload;
