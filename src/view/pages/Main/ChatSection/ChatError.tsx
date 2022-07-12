import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faMagnifyingGlass,
  faVideo,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Avatar from "../../../components/Avatar/Avatar";
import Icon from "../../../components/UI/Icon/Icon";

interface ChatErrorProps {
  message: string;
}

const ChatError: React.FC<ChatErrorProps> = ({ message }: ChatErrorProps) => {
  return <div className="chat-section-error">{message}</div>;
};

export default ChatError;
