import { MessageEnum as MessageType, MessageStatus } from "./MessageEntity";

class Message {
  private id: string;
  private sender: string;
  private type: MessageType;
  private content: string;
  private create_at: number;
  private conversationId: string;
  private status: MessageStatus;

  constructor(
    id: string,
    sender: string,
    type: MessageType,
    content: string,
    create_at: number,
    conversationId: string,
    status = MessageStatus.SENDING
  ) {
    this.id = id;
    this.sender = sender;
    this.type = type;
    this.content = content;
    this.create_at = create_at;
    this.status = status;
    this.conversationId = conversationId;
  }
  getId(): string {
    return this.id;
  }
  getStatus(): MessageStatus {
    return this.status;
  }
  getSender(): string {
    return this.sender;
  }
  setSender(sender: string) {
    this.sender = sender;
  }
  setStatus(status: MessageStatus) {
    this.status = status;
  }
  getContent(): string {
    return this.content;
  }
  setContent(sender: string) {
    this.content = this.content;
  }
  getType(): MessageType {
    return this.type;
  }
  getCreateAt(): number {
    return this.create_at;
  }
  getConversationId(): string {
    return this.conversationId;
  }
}

export default Message;
