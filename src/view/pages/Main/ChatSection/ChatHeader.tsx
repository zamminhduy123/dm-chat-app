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
import GroupAvatar from "../../../components/GroupAvatar/GroupAvatar";
import { getRemainingTime } from "../../../../utils/utils";
import useTranslation from "../../../adapter/translation.adapter";
import { chatInSameTime } from "../../../../utils/chatInSameTime";

interface ChatHeaderProps {
  avatars: string[];
  name: string;
  lastMessageSendingTime: number;
  userNumber: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  avatars,
  name,
  userNumber,
  lastMessageSendingTime,
}: ChatHeaderProps) => {
  const { t } = useTranslation();
  let extraInfo;
  if (userNumber > 2) {
    extraInfo = `${userNumber} ${t("members")}`;
  } else {
    if (chatInSameTime(lastMessageSendingTime, Date.now(), 15 * 60 * 1000)) {
      // 15 minute
      extraInfo = t("Online");
    } else {
      const time = getRemainingTime(lastMessageSendingTime);
      extraInfo = `${t("Last seen")} ${time.value} ${time.type} ${t("ago")}`;
    }
  }
  return (
    <div className="chat-header-container">
      <div className="chat-header-left">
        {avatars.length <= 1 ? (
          <Avatar src={avatars[0]} />
        ) : (
          <GroupAvatar avatars={avatars} />
        )}
        <div className="chat-header-left-body">
          <div>
            <div className="chat-header-left-sender">
              <span>{name}</span>
            </div>
            <div className="chat-header-left-status">
              <span>{extraInfo}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-header-right">
        <div className="chat-header-right-icon">
          <Icon icon={faUserPlus} />
        </div>
        <div className="chat-header-right-icon">
          <Icon icon={faMagnifyingGlass} />
        </div>
        <div className="chat-header-right-icon">
          <Icon icon={faVideo} />
        </div>
        <div className="chat-header-right-icon">
          <Icon icon={faCircleInfo} />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
