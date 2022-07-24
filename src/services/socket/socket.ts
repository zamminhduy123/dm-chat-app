import { io } from "socket.io-client";
import { Fibonacci } from "../../utils/utils";

const MAX_RECONNECTION_ATTEMP = 20,
  TIMEOUT = 20000;

class Socket {
  private _user: string = "";
  static _instance: Socket | null;
  private url: string = "";
  public getUser(): string {
    return this._user;
  }
  public setUser(value: string) {
    this._user = value;
    this.createNewSocket();
  }

  private _retryAttemp = 0;

  private createNewSocket() {
    // if (process.env.REACT_APP_SERVER === "local") url = "http://localhost:3001";
    // else

    this.url = process.env.REACT_APP_API_URL || "http://localhost:3001";
    this.socket = io(this.url, {
      autoConnect: false,
      withCredentials: true,
      reconnection: false,
      timeout: TIMEOUT,
    });

    this.socket.on("disconnect", (reason: string) => {
      if (reason === "io client disconnect") {
        //the reason behind this disconnection is from client kick out
        clearInterval(this.pingInterval);
        return;
      } else {
        console.log(reason);
        this.tryReconnect();
      }
    });

    this.socket.on("connect_fail", () => {
      console.log("Socket connect fail");
    });

    this.socket.on("connect", () => {
      // console.log("Socket establish", this.socket);
      this._connectSuccessCB.forEach((cb: Function) => cb());
      this._retryAttemp = 0;
    });

    this.socket.on("connect_error", (error: Error) => {
      console.log("connect_error", error);

      this._connectErrorCB.forEach((cb: Function) => cb(error));
      this.tryReconnect();
    });

    this.socket.io.on("ping", () => {
      // console.log("Received ping from server");
    });
    this.ping();
  }

  private pingInterval: NodeJS.Timer = setInterval(() => {}, 0);

  private ping() {
    clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      this.socket.timeout(TIMEOUT).emit("PING", (err: Error, response: any) => {
        if (err) {
          // the other side did not acknowledge the event in the given delay
          console.log(err);
          this.disconnect();
          this.tryReconnect();
        } else {
          // console.log(response);
        }
      });
    }, 2 * 60 * 1000);
  }

  public static getInstance(): Socket {
    if (!this._instance) this._instance = new Socket();
    return this._instance;
  }
  private socket: any;

  connect() {
    //checking if user_id is there
    if (!this._user) {
      throw new Error("Need User");
    }
    console.log("Socket connecting", this.socket);
    this.socket.connect();
  }

  private _connectSuccessCB: Function[] = [];
  registerConnectSuccess(callback: () => void) {
    this._connectSuccessCB.push(callback);
  }

  private _connectErrorCB: Function[] = [];
  registerConnectError(cb: (error: Error) => void) {
    this._connectErrorCB.push(cb);
  }

  private _reconnectFail: Function | undefined;
  reconnectFailed = (cb: Function) => {
    this._reconnectFail = cb;
  };

  isConnected = () => {
    return this.socket.connected;
  };

  private tryReconnect = () => {
    if (this._retryAttemp < MAX_RECONNECTION_ATTEMP) {
      setTimeout(() => {
        console.log("socket reconnect attemp", this._retryAttemp);
        this.socket.connect();
        this._retryAttemp++;
      }, Fibonacci.getFibo(this._retryAttemp) * 1000);
      // console.log(Fibonacci.getFibo(this._retryAttemp) * 1000);
    } else {
      //exceed max
      if (this._reconnectFail) this._reconnectFail();
    }
  };

  emit = async <T>(eventName: string, data: T, callback?: Function) => {
    return new Promise<any>((resolve,reject) => {
      this.socket
        .timeout(TIMEOUT)
        .emit(eventName, data, (err: any, response: any) => {
          if (err) {
            reject("Emit timeout")
            // the other side did not acknowledge the event in the given delay
          } else {
            if (callback) callback(response);
            resolve(true);
          }
        });
    })

  };

  registerListener<T>(eventName: string, callback: (data: T) => void) {
    this.socket.on(eventName, callback);
  }

  removeRegisteredListener(eventName: string) {
    this.socket.removeAllListeners(eventName);
  }

  disconnect() {
    console.log("Client disconnect");
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket.close();

    this._connectErrorCB = [];
    this._connectSuccessCB = [];

    clearInterval(this.pingInterval);

    console.log(this.socket);
  }
}
export default Socket;
