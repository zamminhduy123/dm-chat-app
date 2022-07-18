import { MessageEntity } from "../../../entities";

export interface IMessage {
  messages: MessageEntity[];
  hasMore: Boolean;
  selected: MessageEntity | undefined;
}
