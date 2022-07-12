import { MessageEntity, MessageEnum, MessageStatus } from "../../entities";
import { NewMessage } from "../../entities/type/NewMessage";

export const parseContent = (message: MessageEntity | null) => {
  if (message) {
    if (+message.type !== MessageEnum.text) {
      if (typeof message.content === "string")
        message.content = JSON.parse(message.content);
    }
    message.create_at = new Date(message.create_at).getTime();
  }
};
