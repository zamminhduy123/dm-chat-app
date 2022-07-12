import React from "react";
import { UserController } from "../../../../../controller";
import { User, UserEntity } from "../../../../../entities";
import EventEmitter from "../../../../../utils/event-emitter";
import { userConstants } from "../../../../action";
import Modal from "../../../../components/Modal/Modal";
import UserInfo from "../../../../components/UserInfo/UserInfo";

const worker = new Worker(
  new URL("../../../../../worker/phoneParser", import.meta.url)
);

interface TextMessageProps {
  content: string;
  messageId: string;
}

const TextMessage: React.FC<TextMessageProps> = (props: TextMessageProps) => {
  const text = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    worker.postMessage({
      event: "phone-check",
      text: props.content,
      id: props.messageId,
    });

    worker.addEventListener("message", (event) => {
      if (event.data.id === props.messageId) {
        switch (event.data.event) {
          case "phone-parse-result":
            text.current ? (text.current.innerHTML = event.data.text) : null;
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
  }, []);

  const displayUser = async (e: Event) => {
    const div = e.target as HTMLDivElement;
    EventEmitter.emit(userConstants.DISPLAY_USER, div.innerText);
  };

  return (
    <>
      <div
        ref={text}
        style={{
          overflowWrap: "break-word",
          color: `inherit`,
        }}
      >
        <span>{props.content}</span>
      </div>
    </>
  );
};

export default React.memo(TextMessage);
