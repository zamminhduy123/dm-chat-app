import { ConversationEntity, MessageEnum } from "../../entities";
import { Conversation } from "../../entities/conversation/Conversation";
import { UserEntity } from "../../entities/user/UserEntity";
import { mapMessageType } from "../../utils/utils";

export const conversationModelToEntity = (
  conversations: Conversation[]
): ConversationEntity[] => {
  if (conversations.length == 0) {
    return [];
  }
  const result: ConversationEntity[] = [];
  for (const conversation of conversations) {
    const users: UserEntity[] = [];
    for (const user of conversation.getUsers()) {
      users.push({
        username: user.getUsername(),
        name: user.getName(),
        avatar: user.getAvatar(),
        gender: user.getGender(),
        phone: user.getPhone(),
      });
    }
    const lastMessage = conversation.getLastMessage();
    result.push({
      id: conversation.getId(),
      name: conversation.getName(),
      avatar: conversation.getAvatar(),
      users,
      lastMessage: lastMessage
        ? {
            id: lastMessage.getId(),
            sender: lastMessage.getSender(),
            type: lastMessage.getType(),
            content: lastMessage.getContent(),
            create_at: lastMessage.getCreateAt(),
            status: lastMessage.getStatus(),
          }
        : null,
      totalMessage: conversation.getTotalMessage(),
    });
  }
  return result;
};

export const convertLastMessage = (
  conversation: ConversationEntity
): ConversationEntity => {
  const isLastMessageText =
    conversation.lastMessage &&
    +conversation.lastMessage.type === MessageEnum.text;
  return {
    ...conversation,
    lastMessage: conversation.lastMessage
      ? {
          ...conversation.lastMessage,
          content: conversation.lastMessage
            ? isLastMessageText
              ? (conversation.lastMessage.content as string)
              : mapMessageType(+conversation.lastMessage.type)
            : "",
        }
      : null,
  };
};
