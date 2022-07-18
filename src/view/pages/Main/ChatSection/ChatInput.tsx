import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import {
  faThumbsUp,
  faImage,
  faPaperPlane,
} from "@fortawesome/free-regular-svg-icons";
import React, { ChangeEvent, ChangeEventHandler } from "react";
import useTranslation from "../../../adapter/translation.adapter";
import Icon from "../../../components/UI/Icon/Icon";
import SocketController from "../../../../controller/SocketController/SocketController";
import {
  ConversationEntity,
  MessageEnum,
  NewMessage,
  UserEntity,
} from "../../../../entities";
import DotFalling from "../../../components/DotFalling/DotFalling";
import ScrollBottomButton from "../../../components/ScrollBottomButton/ScrollBottomButton";
import { MessageController } from "../../../../controller";
import {
  generateClientId,
  mapMessageType,
  mapTypeMessage,
} from "../../../../utils/utils";
import useAuthApp from "../../../adapter/useAuthApp";

import debounce from "../../../../utils/debounce";

interface ChatInputProps {
  sender: string;
  receiver: UserEntity[];
  conversation: ConversationEntity;
}

const ChatInput: React.FC<ChatInputProps> = ({
  receiver,
  conversation,
  sender,
}: ChatInputProps) => {
  const { t } = useTranslation();
  const input = React.useRef<HTMLInputElement>(null);
  const imageInput = React.useRef<HTMLInputElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const { enqueueMessage } = MessageController.getInstance();

  const otherUsers = receiver.filter((el) => el.username !== sender);
  // console.log("RERENDER CHAT INPUT");
  //SEND MESSAAGE
  const sendMessageHandler = async (
    content: string | File,
    type: MessageEnum,
    preview: string = ""
  ) => {
    let data, newMessage: NewMessage;
    console.log(typeof content === "string");
    if (typeof content === "string") {
      data = content.trim();
    } else {
      data = {
        name: content.name,
        type: content.type,
        content: preview,
        size: content.size,
      };
    }

    if (data) {
      newMessage = {
        sender: sender,
        type: type,
        content: data,
        conversation_id: conversation.id,
        clientID: generateClientId(),
      };

      const tempMessage = {
        ...MessageController.getInstance().createTempMessage(
          newMessage,
          otherUsers.map((el) => el.username)
        ),
      };

      if (
        typeof content !== "string" &&
        typeof tempMessage.content !== "string"
      ) {
        //get URL
        try {
          const url = await MessageController.getInstance().getFileUrl(
            content,
            tempMessage.clientId!
          );
          const fileMessage = {
            ...tempMessage,
            content: {
              ...tempMessage.content,
              content: url,
            },
          };
          enqueueMessage(fileMessage);
        } catch (err: any) {
          console.log("ERRRRRRRRRRRRR", err);
          tempMessage.status = 4;
          setError(err.message);
          setMessageError(err.toString());
          MessageController.getInstance().updateMessage(tempMessage, true);
        }
      } else {
        enqueueMessage(tempMessage);
      }
    }
  };
  // MESSAGE HANDLER
  const fileSelected: ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target && event.target.files) {
      var reader = new FileReader();
      const file = event.target.files[0];
      const type = mapTypeMessage(file.type);

      if (file.size > 10485760) {
        setMessageError("Maximum file size is 10MB");
      } else {
        //load file
        if (type === MessageEnum.image || type === MessageEnum.video) {
          reader.onload = async (e) => {
            if (e.target && e.target.result) {
              sendMessageHandler(file, type, e.target.result.toString());
            }
          };
          reader.readAsDataURL(file);
        } else {
          sendMessageHandler(file, type);
        }
      }
      fileInput.current ? (fileInput.current.value = "") : "";
      imageInput.current ? (imageInput.current.value = "") : "";
    }
  };

  //handler enter click
  React.useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && input.current) {
        e.preventDefault();
        console.log(input.current.innerText);
        if (input.current.innerText.length > 1000) {
          setMessageError("Maximum message length 1000");
          return;
        }
        sendMessageHandler(input.current.innerText, MessageEnum.text);
        input.current.innerText = "";
      }

      if (!typingSendCoolDown && document.activeElement === input.current)
        setTypingSendCoolDown(true);
    };
    document.body.addEventListener("keydown", closeOnEscapeKey);

    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, [sendMessageHandler]);

  // TYPING HANDLER
  const [typingSendCoolDown, setTypingSendCoolDown] = React.useState(false);
  React.useEffect(() => {
    let timeout: any;
    if (typingSendCoolDown) {
      SocketController.getInstance().typingSend();

      timeout = setTimeout(() => {
        setTypingSendCoolDown(false);
      }, 4000);
    }
    return () => {
      timeout ? clearTimeout(timeout) : "";
    };
  }, [typingSendCoolDown]);

  const [isTyping, setIsTyping] = React.useState<string>("");
  const typingReceive = React.useCallback((senderName: string) => {
    if (!isTyping) {
      setIsTyping(senderName);
      // console.log(senderName);
    }
  }, []);
  React.useEffect(() => {
    let timeout: any;
    if (isTyping) {
      timeout = setTimeout(() => {
        setIsTyping("");
      }, 4000);
    }
    return () => {
      timeout ? clearTimeout(timeout) : "";
    };
  }, [isTyping]);

  React.useEffect(() => {
    SocketController.getInstance().typingReceive(typingReceive);

    return () => {
      // console.log("INPUT UNMOUNT");
    };
  }, []);
  React.useEffect(() => {
    setIsTyping("");

    input.current ? (input.current.innerText = "") : null;
  }, [receiver]);

  //MESSAGE SEND ERROR
  const [messageSendError, setMessageError] = React.useState("");
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (messageSendError !== "") {
      setError(true);

      timeout = setTimeout(() => {
        setMessageError("");
      }, 2000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [messageSendError]);

  return (
    <>
      <div className="chat-input-alert">
        {isTyping ? (
          <div className="typing">
            <div>
              {isTyping}
              <span> is typing</span>
              <div>
                <DotFalling size="small" />
              </div>
            </div>
          </div>
        ) : null}
        {error ? (
          <div
            className={`message-send-error ${
              messageSendError ? "slideUp" : "slideDown"
            }`}
          >
            <div>{t(messageSendError)}</div>
          </div>
        ) : null}
      </div>
      <div className="chat-input-container">
        <div className="chat-input-area" onClick={() => input.current?.focus()}>
          <div
            ref={input}
            role="textbox"
            className="rich-input"
            spellCheck={false}
            data-text={t("Send message to") + " " + conversation.name}
            contentEditable={true}
          ></div>
        </div>
        <div className="chat-input-right-panel">
          <div className="chat-input-icon">
            <input
              ref={fileInput}
              type="file"
              id="filebtn"
              hidden
              style={{ display: "none" }}
              onChange={fileSelected}
              accept=".txt,.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <Icon
              icon={faPaperclip}
              onClick={() => {
                fileInput.current?.click();
              }}
            />
          </div>
          <div className="chat-input-icon">
            <input
              ref={imageInput}
              type="file"
              id="imgbtn"
              hidden
              style={{ display: "none" }}
              accept="image/*"
              onChange={fileSelected}
            />
            <Icon
              icon={faImage}
              onClick={() => {
                imageInput.current?.click();
              }}
            />
          </div>
          <div className="chat-input-icon" style={{ marginRight: "16px" }}>
            <Icon
              icon={faPaperPlane}
              onClick={() => {
                if (input.current) {
                  if (input.current.innerText.length > 1000) {
                    setMessageError("Maximum message length 1000");
                    return;
                  }
                  sendMessageHandler(input.current.innerText, MessageEnum.text);
                  input.current.innerText = "";
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(ChatInput);
