import React from "react";
import { UserController } from "../../../../../controller";
import { User, UserEntity } from "../../../../../entities";
import EventEmitter from "../../../../../utils/event-emitter";
import { userConstants } from "../../../../action";
import Modal from "../../../../components/Modal/Modal";
import UserInfo from "../../../../components/Info/UserInfo";
import useTranslation from "../../../../adapter/translation.adapter";

const worker = new Worker(
  new URL("../../../../../worker/phoneParser", import.meta.url)
);

interface TextMessageProps {
  content: string;
  messageId: string;
  isHighlighted?: Boolean;
}

const TextMessage: React.FC<TextMessageProps> = (props: TextMessageProps) => {
  const text = React.useRef<HTMLParagraphElement>(null);
  const { t } = useTranslation();
  let messageEncryptedFail = false,
    message = props.content;
  if (props.content === "Could not decrypt message") {
    messageEncryptedFail = true;
    message = `${t("Could not decrypt message")}. `;
  }

  React.useEffect(() => {
    if (props.content !== "Could not decrypt message") {
      worker.postMessage({
        event: "phone-check",
        text: props.content,
        id: props.messageId,
      });
      worker.addEventListener("message", (event) => {
        if (event.data.id === props.messageId) {
          switch (event.data.event) {
            case "phone-parse-result":
              let data = event.data.text;
              text.current ? (text.current.innerHTML = data) : null;
              const phoneText =
                text.current?.getElementsByClassName("user-phone");
              if (phoneText?.length) {
                for (let i = 0; i < phoneText.length; i++) {
                  phoneText[i].addEventListener("click", displayUser);
                }
              }
              break;
          }
        }
      });
    }
  }, []);

  const displayUser = async (e: Event) => {
    const div = e.target as HTMLDivElement;
    EventEmitter.emit(userConstants.DISPLAY_USER, div.innerText);
  };

  const learnMoreOnClick = () => {
    window.open(
      "https://help.zalo.me/huong-dan/chuyen-muc/nhan-tin-va-goi/xu-ly-cac-loi-trong-tro-chuyen-da-nang-cap-ma-hoa-dau-cuoi/?zarsrc=30&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo#a4"
    );
  };

  return (
    <>
      <div
        ref={text}
        style={{
          overflowWrap: "break-word",
          color: props.isHighlighted ? "#fff" : `inherit`,
          fontFamily: "Inter",
          whiteSpace: "pre-wrap",
        }}
      >
        {message}
        {messageEncryptedFail ? (
          <span className="learn-more" onClick={learnMoreOnClick}>
            {t("Learn more")}
          </span>
        ) : null}
      </div>
    </>
  );
};

export default React.memo(TextMessage);
