import React from "react";
import { ConversationEntity, MessageEnum } from "../../../entities";
import Avatar from "../Avatar/Avatar";
import {
  capitalizeFirstLetter,
  getRemainingTime,
  mapMessageType,
} from "../../../utils/utils";
import useAuthApp from "../../adapter/useAuthApp";
import useTranslation from "../../adapter/translation.adapter";
import SocketController from "../../../controller/SocketController/SocketController";
import GroupAvatar from "../GroupAvatar/GroupAvatar";

export type ConversationProps = {
  conversation: ConversationEntity;
  onClick: (conv: ConversationEntity) => void;
  selected?: Boolean;
};

const ConversationItem: React.FC<ConversationProps> = ({
  conversation,
  onClick,
  selected = false,
}: ConversationProps) => {
  const time = getRemainingTime(
    new Date(conversation.lastMessage?.create_at || new Date()).getTime()
  );
  const classname = ["conversation-container", selected ? "selected" : ""].join(
    " "
  );
  const { user } = useAuthApp();
  const { t } = useTranslation();
  return (
    <li
      className={classname}
      onClick={() => {
        SocketController.getInstance().typingRegister(conversation.id);
        onClick(conversation);
      }}
    >
      <div>
        {conversation.users.length <= 2 ? (
          <Avatar src={conversation.avatar} />
        ) : (
          <GroupAvatar avatars={conversation.users.map((u) => u.avatar)} />
        )}
        <div className="conversation-body">
          <div className="conversation-body-main">
            <div className="conversation-sender">
              <span className="truncate" style={{ maxWidth: "200px" }}>
                {conversation.name}
              </span>
              <span className="conversation-body-extra">
                {conversation.lastMessage
                  ? `${time.value || 1} ${time.type}`
                  : ""}
              </span>
            </div>
            <div className="conversation-content">
              {user === conversation.lastMessage?.sender ? (
                <span>{`${t("You")}:`}</span>
              ) : conversation.users.length > 2 ? (
                conversation.lastMessage && conversation.lastMessage.content ? (
                  <span>{`${
                    conversation.users.filter(
                      (u) => u.username === conversation.lastMessage?.sender
                    )[0].name
                  }:`}</span>
                ) : null
              ) : null}
              <span
                className="truncate"
                style={{ display: "block", maxWidth: "70%" }}
              >
                {conversation.lastMessage && conversation.lastMessage.content
                  ? +conversation.lastMessage.type !== MessageEnum.text
                    ? t(
                        capitalizeFirstLetter(
                          conversation.lastMessage.content as string
                        )
                      )
                    : (conversation.lastMessage.content as string)
                  : conversation.id
                  ? t("No message yet")
                  : null}
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ConversationItem;
