import React from "react";
import "./FadeAlert.scss";

interface FadeAlertProps {
  message: string;
}

const FadeAlert = ({ message }: FadeAlertProps) => {
  return <div className="fade-alert-container">{message}</div>;
};

export default FadeAlert;
