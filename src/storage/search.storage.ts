import { lastCharacterAfter, lastCharacterBefore } from "../utils/searchBound";
import db, { indexName, storeNames } from "./storageAdapter/searchDB";
import { sKeywordMessageEntity } from "./storageEntity/sKeywordMessageEntity";

interface ISearchStorage {
  getDataByKeyword(keyword: string): Promise<sKeywordMessageEntity[]>;
  upsert(kw: sKeywordMessageEntity[]): Promise<any>;
}
export default class SearchStorage implements ISearchStorage {
  getDataByKeyword(keyword: string): Promise<sKeywordMessageEntity[]> {
    return new Promise<sKeywordMessageEntity[]>(async (resolve, reject) => {
      try {
        //get keyword index
        console.log(lastCharacterBefore(keyword),lastCharacterAfter(keyword))
        const datas = await db.getManyWithIndex<sKeywordMessageEntity[]>(
          storeNames.keyword_message,
          indexName.keyword,
          [lastCharacterBefore(keyword)],
          [lastCharacterAfter(keyword)],
          "next",
          false,
          100
        );
        resolve(datas);
      } catch (err) {
        reject(err);
      }
    });
  }
  upsert(kw: sKeywordMessageEntity[]) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const data = await db.upsert<sKeywordMessageEntity>(
          storeNames.keyword_message,
          kw
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
