import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faMagnifyingGlass,
  faVideo,
  faCircleInfo,
  faBars,
  faRightToBracket,
  faArrowLeftLong,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Avatar from "../../../components/Avatar/Avatar";
import Icon from "../../../components/UI/Icon/Icon";
import GroupAvatar from "../../../components/GroupAvatar/GroupAvatar";
import { getRemainingTime } from "../../../../utils/utils";
import useTranslation from "../../../adapter/translation.adapter";
import { chatInSameTime } from "../../../../utils/chatInSameTime";
import eventEmitter from "../../../../utils/event-emitter";
import { userConstants } from "../../../action";

interface ChatHeaderProps {
  avatars: string[];
  name: string;
  lastMessageSendingTime: number;
  userNumber: number;
  info: string;
  showHeader: boolean;
  toggleHeader: Function;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  avatars,
  name,
  userNumber,
  lastMessageSendingTime,
  info,
  showHeader,
  toggleHeader,
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

  return showHeader ? (
    <div className={`chat-header-container`}>
      <div className={`chat-header-left`}>
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
        {/* <div className="chat-header-right-icon">
          <Icon icon={faUserPlus} />
        </div>
        <div className="chat-header-right-icon">
          <Icon icon={faMagnifyingGlass} />
        </div> */}
        {/* <div className="chat-header-right-icon">
          <Icon icon={faVideo} />
        </div> */}
        {userNumber === 2 && showHeader ? (
          <div
            className="chat-header-right-icon"
            onClick={() => {
              eventEmitter.emit(userConstants.DISPLAY_USER, info);
            }}
          >
            <Icon icon={faCircleInfo} />
          </div>
        ) : null}
        <div
          className="chat-header-right-icon"
          onClick={() => {
            toggleHeader();
          }}
        >
          <Icon icon={faRightToBracket} />
        </div>
      </div>
    </div>
  ) : (
    <div style={{ width: "fit-content" }}>
      <div
        className="chat-header-right-icon"
        onClick={() => {
          toggleHeader();
        }}
      >
        <Icon icon={faBars} />
      </div>
    </div>
  );
};

export default ChatHeader;
