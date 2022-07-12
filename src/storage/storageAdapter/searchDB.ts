import IndexedDBAdapter, { IObjectStore } from "./indexedDB";

const dbName = "search",
  version = 1;

export const storeNames = {
  keyword_index: "keyword_index",
  keyword_message: "keyword_message",
};

export const indexName = {
  keyword: "keyword",
  msgId: "msgId",
};

const stores: IObjectStore[] = [
  // {
  //   name: storeNames.keyword_index,
  //   option: {
  //     keyPath: "index",
  //     autoIncrement: true,
  //   },
  //   indexes: [
  //     {
  //       name: indexName.keyword,
  //       keyPath: [indexName.keyword],
  //       option: {
  //         unique: false,
  //       },
  //     },
  //   ],
  // },
  {
    name: storeNames.keyword_message,
    option: {
      keyPath: "index",
      autoIncrement: true,
    },
    indexes: [
      {
        name: indexName.keyword,
        keyPath: [indexName.keyword],
        option: {
          unique: false,
        },
      },
    ],
  },
];

const db = new IndexedDBAdapter(dbName, version, stores);
export default db;
