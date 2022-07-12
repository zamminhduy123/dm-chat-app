export interface IIndex {
  name: string;
  keyPath: string[];
  option?: Object;
}

export interface IObjectStore {
  name: string;
  option?: Object;
  indexes: IIndex[];
}

export default class IndexedDBAdapter {
  private dbName: string;
  private dbNamePrefix: string;
  private dbVersion: number;
  private stores: IObjectStore[];

  private awaitInit: Promise<any>;
  private resolveInit: any;

  constructor(dbNamePrefix: string, dbVersion = 1, stores: IObjectStore[]) {
    this.dbName = "";
    this.dbNamePrefix = dbNamePrefix;
    this.dbVersion = dbVersion;
    this.stores = stores;
    this.awaitInit = new Promise((res, rej) => {
      this.resolveInit = res;
    });
  }

  setDBName(username: string) {
    this.dbName = this.dbNamePrefix + "-" + username;
    this.resolveInit();
  }

  private createStores(db: IDBDatabase) {
    this.stores.forEach((store) => {
      let objStore = db.createObjectStore(store.name, store.option);
      store.indexes.forEach((index) => {
        objStore.createIndex(index.name, index.keyPath, index.option);
      });
      objStore.transaction.oncomplete = (event) => {
        db.transaction(store.name, "readwrite").objectStore(store.name);
      };
    });
  }

  openDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>(async (resolve, reject) => {
      if (this.dbName == "") await this.awaitInit;
      if (!window.indexedDB) reject({ message: "Unsupported indexedDB" });

      let request = window.indexedDB.open(`${this.dbName}`, this.dbVersion);
      request.onerror = (event) => {
        reject({ message: request.error });
      };
      request.onsuccess = (event) => {
        resolve(request.result);
      };
      request.onblocked = () => console.warn("pending till unblocked");
      request.onupgradeneeded = () => {
        this.createStores(request.result);
      };
    });
  }

  deleteDB() {
    if (window.indexedDB) {
      window.indexedDB.deleteDatabase(this.dbName);
    }
  }

  getAll = <T>(storeName: string, key?: any, limit?: number): Promise<T> => {
    return new Promise<T>(async (resolve, reject) => {
      let conn;
      try {
        conn = await this.openDB();
        let request = conn
          .transaction(storeName)
          .objectStore(storeName)
          .getAll(key, limit);
        request.onsuccess = (e) => {
          console.log(request.result);
          const result = request.result as unknown;
          resolve(result as T);
        };
        request.onerror = (e) => reject(request.error);
      } finally {
        if (conn) conn.close();
      }
    });
  };

  private getBound(lower: any = "", upper: any = "") {
    let range: IDBKeyRange | undefined;
    if (lower !== "" && upper !== "") {
      range = IDBKeyRange.bound(lower, upper, false, false);
    } else if (lower === "") {
      range = IDBKeyRange.upperBound(upper, false);
    } else if (upper === "") {
      range = IDBKeyRange.lowerBound(lower, false);
    }
    return range;
  }

  getMany = <T>(
    storeName: string,
    limit?: number,
    lower: any = "",
    upper: any = "",
    direction: IDBCursorDirection = "prev"
  ): Promise<T> => {
    return new Promise<T>(async (resolve, reject) => {
      let conn;
      try {
        conn = await this.openDB();
        const range = this.getBound(lower, upper);
        const request = conn
          .transaction(storeName)
          .objectStore(storeName)
          .openCursor(range, direction);

        const result: any = [];

        request.onsuccess = function (event) {
          const cursor = request.result;

          if (cursor) {
            // listItem.innerHTML = cursor.value.albumTitle + ", " + cursor.value.year;
            result.push(cursor.value);
            cursor.continue();
          } else {
            resolve(result as T);
          }
        };
      } finally {
        if (conn) conn.close();
      }
    });
  };

  getManyWithIndex = <T>(
    storeName: string,
    index: string,
    lower: any = "",
    upper: any = "",
    direction: IDBCursorDirection = "prev",
    reverse: Boolean = false,
    limit?: number
  ): Promise<T> => {
    return new Promise<T>(async (resolve, reject) => {
      let conn;
      try {
        conn = await this.openDB();
        const range = this.getBound(lower, upper);
        const request = conn
          .transaction(storeName)
          .objectStore(storeName)
          .index(index)
          .openCursor(range, direction);

        const result: any = [];

        let ind = limit;

        request.onsuccess = function (event) {
          const cursor = request.result;

          if (cursor) {
            if (limit) {
              if (!ind) {
                resolve(result as T);
                return;
              } else {
                ind--;
              }
            }
            if (reverse) {
              result.unshift(cursor.value);
            } else result.push(cursor.value);
            cursor.continue();
          } else {
            resolve(result as T);
          }
        };
      } finally {
        if (conn) conn.close();
      }
    });
  };

  getAllWithIndex = <T>(
    storeName: string,
    index: string,
    lower: any = "",
    upper: any = "",
    direction: IDBCursorDirection = "nextunique",
    limit?: number
  ): Promise<T> => {
    return new Promise<T>(async (resolve, reject) => {
      let conn;
      try {
        conn = await this.openDB();
        const range = this.getBound(lower, upper);
        let request = conn
          .transaction([storeName])
          .objectStore(storeName)
          .index(index)
          .getAll(range, limit);
        request.onsuccess = (e) => {
          const result = request.result as unknown;
          // console.log(request);
          resolve(result as T);
        };
        request.onerror = (e) => reject(request.error);
      } finally {
        if (conn) conn.close();
      }
    });
  };

  upsert = <T>(storeName: string, data: T[]): Promise<any> => {
    return new Promise<any>(async (resolve, reject) => {
      if (!data) {
        resolve(1);
      }
      let conn;
      try {
        conn = await this.openDB();

        let transaction = conn.transaction([storeName], "readwrite");
        transaction.oncomplete = (event) => {
          resolve(1);
        };
        transaction.onerror = (event) => {
          reject(transaction.error);
        };
        var objectStore = transaction.objectStore(storeName);
        data.forEach((d) => {
          let request = objectStore.add(d);
          request.onsuccess = () => {
            // console.log(` added: ${request.result}`);
          };

          request.onerror = (err) => {
            console.error(`Error add `, err);
          };
        });
      } finally {
        if (conn) conn.close();
      }
    });
  };

  tryUpsert = <T>(storeName: string, data: T[]): Promise<any> => {
    return new Promise<any>(async (resolve, reject) => {
      if (!data) {
        resolve(1);
      }
      let conn;
      try {
        conn = await this.openDB();

        let transaction = conn.transaction([storeName], "readwrite");
        transaction.oncomplete = (event) => {
          resolve(1);
        };
        transaction.onerror = (event) => {
          resolve(1);
        };
        var objectStore = transaction.objectStore(storeName);
        data.forEach((d) => {
          let request = objectStore.add(d);
          request.onsuccess = () => {
            // console.log(` added: ${request.result}`);
          };

          request.onerror = (err) => {
            console.error(`Error add `, err);
          };
        });
      } finally {
        if (conn) conn.close();
      }
    });
  };
  update = <T>(storeName: string, datas: T[]): Promise<any> => {
    return new Promise<any>(async (resolve, reject) => {
      let conn;
      try {
        conn = await this.openDB();

        let transaction = conn.transaction([storeName], "readwrite");
        transaction.oncomplete = (event) => {
          // console.log("update done!");
          resolve(1);
        };
        transaction.onerror = (event) => {
          // Don't forget to handle errors!
          reject(transaction.error);
        };
        var objectStore = transaction.objectStore(storeName);
        datas.forEach((data) => {
          let request = objectStore.put(data);
          request.onsuccess = (e) => {};
          request.onerror = (e) => reject(request.error);
        });
      } finally {
        if (conn) conn.close();
      }
    });
  };

  get<T>(
    storeName: string,
    key: any,
    lower: string = "",
    upper: string = ""
  ): Promise<T> {
    var range: IDBKeyRange | undefined;
    if (lower !== "" && upper !== "") {
      range = IDBKeyRange.bound(lower, upper);
    } else if (lower === "") {
      range = IDBKeyRange.upperBound(upper);
    } else if (upper === "") {
      range = IDBKeyRange.lowerBound(lower);
    }

    return new Promise<T>(async (resolve, reject) => {
      let conn;
      try {
        conn = await this.openDB();

        let request = conn
          .transaction(storeName)
          .objectStore(storeName)
          .get(key || range);

        request.onsuccess = (e) => {
          resolve(request.result);
        };
        request.onerror = (e) => reject(request.error);
      } finally {
        if (conn) conn.close();
      }
    });
  }

  delete(storeName: string, keys: string[]): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      let conn;
      try {
        conn = await this.openDB();

        const transaction = conn.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);

        transaction.oncomplete = (event) => {
          resolve(1);
        };
        transaction.onerror = (event) => {
          // Don't forget to handle errors!
          reject(transaction.error);
        };

        keys.forEach((key) => {
          let request = objectStore.delete(key);
          request.onsuccess = (e) => {};
          request.onerror = (e) => reject(request.error);
        });
      } finally {
        if (conn) conn.close();
      }
    });
  }
}
