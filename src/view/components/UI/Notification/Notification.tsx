import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import {
  faTriangleExclamation,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Spinner from "../Spinner/Spinner";
import "./Notification.scss";

interface NotificationProps {
  type: string;
  message: string;
  vertical?: Boolean;
  border?: Boolean;
  variant?: "contained" | "outlined";
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  vertical = false,
  border = true,
  variant = "outlined",
}: NotificationProps) => {
  let notiIcon = faCircleCheck;
  switch (type) {
    case "error":
      notiIcon = faCircleXmark;
      break;
    case "warning":
      notiIcon = faTriangleExclamation;
      break;
  }
  const className = [
    `notification-container`,
    border ? "notification-border" : "",
    variant === "outlined" ? `notification-${type}` : `contained-${type}`,
  ].join(" ");
  return (
    <div className={className} style={{ height: "40px" }}>
      <div className={vertical ? `vertical` : "d-flex flex-center"}>
        <div className={`notification-icon`}>
          {type == "loading" ? (
            <Spinner />
          ) : (
            <FontAwesomeIcon
              className={
                variant === "outlined" ? `notification-${type}` : `white`
              }
              icon={notiIcon}
            />
          )}
        </div>
        <p
          className={`notification-message ${
            variant === "outlined" ? `notification-${type}` : `white`
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default Notification;
