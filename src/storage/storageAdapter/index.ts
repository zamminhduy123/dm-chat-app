import IndexedDBAdapter, { IObjectStore, IIndex } from "./indexedDB";

const dbName = "ZaDB",
  version = 1;

export const storeNames = {
  conversation: "conversation",
  message: "message",
  pending: "pending_message",
  encrypt_prekey: "encrypt_prekey",
  encrypt_session: "encrypt_session",
  encrypt_sharedKey: "encrypt_sharedKey",
};

export const indexName = {
  lastMessageTime: "lastMessageTime",
  conversationId_sendTime: "conversationId_sendTime",
  status_sendTime: "status_sendTime",
  clientId_MsgId: "clientId_MsgId",
  identifier_lastModified: "identifier_lastModified"
};

const stores: IObjectStore[] = [
  {
    name: storeNames.conversation,
    option: {
      keyPath: "id",
    },
    indexes: [
      {
        name: "lastMessageTime",
        keyPath: ["lastMessageTime"],
        option: {
          unique: true,
        },
      },
    ],
  },
  {
    name: storeNames.message,
    option: {
      keyPath: "id",
    },
    indexes: [
      {
        name: "conversationId_sendTime",
        keyPath: ["conversation_id", "create_at"],
        option: {
          unique: true,
        },
      },
      {
        name: "status_sendTime",
        keyPath: ["status", "create_at"],
        option: {
          unique: true,
        },
      },
      {
        name: "clientId_MsgId",
        keyPath: ["clientId"],
        option: {
          unique: true,
        },
      },
    ],
  },
  {
    name: storeNames.pending,
    option: {
      keyPath: "clientMsgId",
    },
    indexes: [],
  },
  {
    name: storeNames.encrypt_sharedKey,
    option: {
      keyPath: ["identifier"],
    },
    indexes: [{
      name: "identifier_lastModified",
      keyPath: ["identifier","lastModified"],
      option: {
        unique: true,
      },
    },],
  },
];

const db = new IndexedDBAdapter(dbName, version, stores);
export default db;
