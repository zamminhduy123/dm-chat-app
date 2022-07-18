import { Conversation } from "../../entities/conversation/Conversation";
import { Message } from "../../entities/message";
import { User } from "../../entities/user/User";

export const standardConversationArray = (ObjArray: any[]): Conversation[] => {
  if (ObjArray.length == 0) {
    return [];
  }
  const result: Conversation[] = [];
  for (const conversation of ObjArray) {
    const users: User[] = [];
    for (const user of conversation.users) {
      users.push(
        new User(user.username, user.name, user.gender, user.avatar, user.phone)
      );
    }
    const lastMessage = conversation.lastMessage;
    result.push(
      new Conversation(
        conversation.id,
        conversation.name,
        users,
        conversation.avatar,
        lastMessage
          ? new Message(
              lastMessage.id,
              lastMessage.sender,
              lastMessage.type,
              lastMessage.content,
              lastMessage.create_at,
              lastMessage.conversation_id,
              lastMessage.status,
              lastMessage.to
            )
          : lastMessage,
        conversation.totalMessage
      )
    );
  }
  return result;
};
