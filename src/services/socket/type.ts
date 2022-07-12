import { MessageEntity } from "../../entities";

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  message: MessageEntity;
}

export type SocketRegister = <T>(
  eventName: string,
  callback: (data: T) => void
) => void;
export type SocketEmit = <T>(eventName: string, data: T) => void;
