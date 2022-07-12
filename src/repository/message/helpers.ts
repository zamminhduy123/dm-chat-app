import { Message, MessageEntity, MessageEnum } from "../../entities";
import { mapTypeMessage } from "../../utils/utils";

export const standardMessageArray = (ObjArray: any[]): Message[] => {
  if (ObjArray.length == 0) {
    return [];
  }
  const result: Message[] = [];
  for (const message of ObjArray) {
    let content = message.content;
    result.push(
      new Message(
        message.id,
        message.sender,
        message.type,
        content,
        message.create_at,
        message.conversation_id,
        message.status
      )
    );
  }
  return result;
};

// export const modelToEntity = (message: Message): NewMessage => {
//   return {
//     sender: message.getSender(),
//     type: message.getType(),
//     content: message.getContent(),
//   };
// };
