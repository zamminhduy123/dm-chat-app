import {
  ConversationEntity,
  MessageEntity,
  RegisterData,
  UserEntity,
} from "../entities";
import axios, { AxiosError } from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024;

axios.defaults.timeout = 10000;

export class ClientAPI {
  private origin: string;
  constructor() {
    // this.origin = "http://localhost:3001";
    // if (process.env.REACT_APP_SERVER === "local")
    this.origin = "https://za-chat-be.onrender.com";
  }
  async _handleUnauthorized() {
    //get new token from refresh token
    try {
    } catch (err) {
      //if still error => throw err => logout;
      throw new Error("Unauthorized");
    }
  }
  handleError(error: AxiosError) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data) {
        return error.response.data;
      }
    }
    console.log("Request Error: ", error);
    return error;
  }
  _createUrl(path: string) {
    return `${this.origin}/${path}`;
  }
  _get<T>(url: string): Promise<T> {
    return this._fetch(url, "get");
  }
  _post<T>(url: string, data: any, contentType?: string): Promise<T> {
    return this._fetch(url, "post", data, contentType);
  }
  _put<T>(url: string, data: any): Promise<T> {
    return this._fetch(url, "put", data);
  }
  _delete<T>(url: string, data?: any): Promise<T> {
    return this._fetch(url, "delete", data);
  }
  async _fetch<T>(
    url: string,
    type: "get" | "post" | "put" | "delete",
    data?: any,
    contentType = "application/json"
  ): Promise<T> {
    return new Promise<any>(async (resolve, reject) => {
      const requestOptions = {
        method: type,
        url: url,
        headers: {
          "Content-Type": contentType,
        },
        withCredentials: true,
        ...(data ? { data: data } : null),
      };
      axios(requestOptions)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err: AxiosError) => {
          // if (err.status? === 401) {
          //   await this._handleUnauthorized();
          // }
          reject(this.handleError(err));
        });
    });
  }
  async _chunkUpload(file: File, onProgress?: Function) {
    return new Promise<any>((resolve, reject) => {
      let currentChunkIndex = 0;

      const createChunkFile = () => {
        const reader = new FileReader();
        const from = currentChunkIndex * CHUNK_SIZE;
        const to = from + CHUNK_SIZE;
        const blob = file.slice(from, to);
        reader.readAsDataURL(blob);
        reader.onload = (e) => {
          const data = e.target?.result;
          const params = new URLSearchParams();
          params.set("name", file.name);
          params.set("size", file.size.toString());
          params.set("currentChunkIndex", currentChunkIndex.toString());
          params.set(
            "totalChunks",
            Math.ceil(file.size / CHUNK_SIZE).toString()
          );
          const headers = { "Content-Type": "application/octet-stream" };
          const url = this._createUrl("file/chunkUpload?" + params.toString());
          axios
            .post(url, data, { headers })
            .then((response) => {
              const filesize = file.size;
              const chunks = Math.ceil(filesize / CHUNK_SIZE) - 1;
              const isLastChunk = currentChunkIndex === chunks;
              console.log(
                onProgress,
                Math.ceil(((currentChunkIndex + 1) / (chunks + 1)) * 100)
              );
              onProgress
                ? onProgress(
                    Math.ceil(((currentChunkIndex + 1) / (chunks + 1)) * 100)
                  )
                : null;
              if (isLastChunk) {
                resolve(response.data);
              } else {
                currentChunkIndex++;
                createChunkFile();
              }
            })
            .catch((err) => {
              reject(this.handleError(err));
            });
        };
      };
      createChunkFile();
    });
  }
  async register(registerData: RegisterData) {
    const url = this._createUrl("authentication/register");
    const formData = new FormData();

    for (const [key, value] of Object.entries(registerData)) {
      if (value) formData.append(key, value);
    }
    return this._post<any>(url, formData, "multipart/form-data");
  }
  async login(username: string, password: string) {
    if (!username)
      throw new Error("ClientNetworkError: miss credential when login");
    const url = this._createUrl("authentication/login");
    const data = {
      username,
      password,
    };
    return this._post<UserEntity>(url, data);
  }
  async logout() {
    const url = this._createUrl("authentication/logout");
    return this._post(url, null);
  }
  async authenticate() {
    const url = this._createUrl("authentication");
    return this._get<UserEntity>(url);
  }
  async getConversation(username: string) {
    const url = this._createUrl(`conversation?username=${username}`);
    return this._get<ConversationEntity[]>(url);
  }
  async createConversation(conversation: ConversationEntity) {
    const url = this._createUrl(`conversation/newGroup`);
    return this._post<ConversationEntity>(url, conversation);
  }
  async getNewMessage(lastMessageId?: string) {
    const lastMessageQuery = lastMessageId ? `${lastMessageId}` : "0";
    const url = this._createUrl(`message?lastMessageId=${lastMessageQuery}`);
    return this._get<any>(url);
  }
  async findUser(searchContent: string) {
    const url = this._createUrl(`user?content=${searchContent}`);
    return this._get<UserEntity[]>(url);
  }
  async sendFile(file: File, onProgress?: Function) {
    const url = this._createUrl("file");
    if (file.size < 5 * 1024 * 1024) {
      const formData = new FormData();
      formData.append("file", file);
      return this._post(url, formData, "multipart/form-data");
    } else {
      return this._chunkUpload(file, onProgress);
    }
  }

  // changePassword(
  //   oldPassword: string,
  //   newPassword: string,
  //   confirmPassword: string
  // ) {
  //   const url = this._createUrl("auth/change-password");
  //   const body = {
  //     oldPassword,
  //     newPassword,
  //     confirmPassword,
  //   };
  //   return this._post(url, JSON.stringify(body));
  // }
  // forgotPassword(credentital: string) {
  //   const url = this._createUrl("auth/forgot-password");
  //   const body = {
  //     credentital,
  //   };
  //   return this._post(url, JSON.stringify(body));
  // }
}
const Fetcher = new ClientAPI();
export default Fetcher;
