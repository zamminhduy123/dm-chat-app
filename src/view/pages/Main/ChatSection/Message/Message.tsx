import { t } from "i18next";
import React from "react";
import {
  MessageEntity,
  MessageEnum,
  MessageStatus,
  FileEntity,
  UserEntity,
} from "../../../../../entities";
import {
  capitalizeFirstLetter,
  getRemainingTime,
  isValidHttpUrl,
  mapMessageStatus,
} from "../../../../../utils/utils";
import useAuthApp from "../../../../adapter/useAuthApp";
import Avatar from "../../../../components/Avatar/Avatar";
import FileMessage from "./FileMessage";
import ImageMessage from "./ImageMessage";
import TextMessage from "./TextMessage";
import noImageUrl from "../../../../../assets/no-image.png";
import Icon from "../../../../components/UI/Icon/Icon";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import VideoMessage from "./VideoMessage";

interface MessageProps {
  message: MessageEntity;
  hasAvatar: Boolean;
  hasTime: Boolean;
  resend?: Function;
  hasStatus: Boolean;
  conversationMember: UserEntity[];
  isHighlighted?: Boolean;
}

const Message: React.FC<MessageProps> = (props: MessageProps) => {
  const { user, avatar } = useAuthApp();
  const left = user != props.message.sender;
  const time = getRemainingTime(
    new Date(props.message.create_at || new Date()).getTime()
  );
  const flexDir = left ? "row" : "row-reverse";
  let content: React.ReactNode;
  // console.log(props.message.type);
  if (+props.message.type === MessageEnum.text) {
    if (typeof props.message.content === "string") {
      content = (
        <TextMessage
          messageId={props.message.id || props.message.clientId!}
          content={props.message.content}
          isHighlighted={props.isHighlighted}
        />
      );
    }
  } else {
    // console.log(props.message.content);
    if (typeof props.message.content !== "string") {
      if (+props.message.type === MessageEnum.image) {
        content = <ImageMessage message={props.message} />;
      }
      if (+props.message.type === MessageEnum.video) {
        content = <VideoMessage message={props.message} />;
      }

      if (+props.message.type === MessageEnum.file) {
        content = <FileMessage message={props.message} />;
      }
    }
  }

  //hover
  const [hover, setHover] = React.useState(false);

  const avatarURL = left
    ? props.conversationMember.find(
        (user) => user.username === props.message.sender
      )?.avatar
    : avatar;
  return (
    <div
      onMouseEnter={() => {
        if (+props.message.type === MessageEnum.image) setHover(true);
      }}
      onMouseLeave={() => {
        if (+props.message.type === MessageEnum.image) setHover(false);
      }}
      style={{
        display: "flex",
        flexDirection: `${flexDir}`,
        textAlign: "left",
        marginBottom: props.hasTime ? "10px" : "4px",
        maxWidth: "100%",
      }}
    >
      {props.hasAvatar ? (
        <Avatar size="small" src={avatarURL} left={left} right={!left} />
      ) : (
        <div style={{ width: "44px" }}></div>
      )}
      <div
        className="d-flex flex-column"
        style={{
          width: "fit-content",
          height: "fit-content",
          maxWidth: "80%",
          maxHeight: "50%",
          overflowWrap: "break-word",
          background: `${
            +props.message.type === MessageEnum.image
              ? "transparent"
              : props.isHighlighted
              ? "#5EBA7D"
              : !left
              ? "white"
              : "linear-gradient(45deg,#fd267a,#ff6036)"
          }`,
          zIndex: "100",
          fontSize: "15px",
          padding: +props.message.type !== MessageEnum.image ? "12px" : "0px",
          boxShadow:
            +props.message.type === MessageEnum.text
              ? "0 1px 0 0 rgba(0,0,0,0.18)"
              : "",
          borderRadius: "10px",
          color: `${!left ? "#001a33" : "white"}`,
        }}
      >
        {content}
        {props.hasTime && +props.message.status !== MessageStatus.ERROR ? (
          <span
            style={{
              display: "flex",
              width: "100%",
              fontSize: "13px",
              fontWeight: "400",
              color: `${
                +props.message.type === MessageEnum.image || !left
                  ? "rgba(0,0,0,0.5)"
                  : "rgba(255,255,255,0.7)"
              }`,
              marginTop: "10px",
            }}
          >
            {!left && props.hasStatus ? (
              <span className="d-flex" style={{ flexGrow: "1" }}>
                {t(
                  capitalizeFirstLetter(mapMessageStatus(+props.message.status))
                )}
                <div style={{ flexGrow: "1", minWidth: "5px" }}></div>
              </span>
            ) : null}
            {props.hasTime || props.hasStatus
              ? left
                ? time.value
                  ? `${time.value} ${time.type}`
                  : t("Just sent")
                : time.value
                ? `${time.value} ${time.type}`
                : ""
              : ""}
          </span>
        ) : null}
        {+props.message.status === MessageStatus.ERROR ? (
          <span
            className="d-flex"
            style={{
              fontSize: "13px",
              fontWeight: "400",
              color: `var(--color-danger)`,
              marginTop: "10px",
            }}
            onClick={() => props.resend?.(props.message)}
          >
            {t("Error")}&nbsp;
            <div style={{ flexGrow: "1" }}></div>
            <span
              style={{
                textAlign: "right",
                cursor: "pointer",
                color: "var(--color-primary)",
                textDecoration: "underline",
              }}
            >
              {t("Resent")}
            </span>
          </span>
        ) : null}
      </div>
      {hover ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            paddingBlockEnd: props.hasStatus || props.hasTime ? "25px" : "0px",
          }}
          onClick={() => {
            typeof props.message.content !== "string"
              ? window.electronAPI
                ? window.electronAPI.files.downloadFile(
                    props.message.content.content,
                    props.message.content.name
                  )
                : ""
              : "";
          }}
        >
          <Icon icon={faDownload} />
        </div>
      ) : null}
    </div>
  );
};

export default Message;
