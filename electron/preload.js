const { contextBridge, ipcRenderer } = require("electron");

const files = {
  downloadFile: async (url, name, id) =>
    ipcRenderer.send("download", {
      payload: {
        fileUrl: url,
        name,
        id,
      },
    }),
  onDownloadProgress: (callback) =>
    ipcRenderer.on("download-progress", (event, { progress, id }) => {
      callback(progress * 100, id);
    }),
  onDownloadComplete: (callback) =>
    ipcRenderer.on("download-complete", (event, { item, id }) => {
      callback(item, id);
    }),
};

const photo = {
  viewPhoto: async (imageMessage) =>
    ipcRenderer.send("view-photo", {
      payload: {
        imageMessage,
      },
    }),
  loadUrl: (callback) =>
    ipcRenderer.on("photo-view-ready", (event, imageMessage) => {
      callback(imageMessage);
    }),
};

const notification = {
  newNotification: async (title, message) =>
    ipcRenderer.send("new-noti", {
      payload: {
        title,
        message,
      },
    }),
};

const _window = {
  minimize: () => ipcRenderer.send("window/minimize"),
  hide: () => ipcRenderer.send("window/hide"),
  show: () => ipcRenderer.send("window/show"),
  quit: () => ipcRenderer.send("window/quit"),
};

const API = {
  files: files,
  window: _window,
  photo: photo,
  IN_DESK_ENV: true,
  notification: notification,
};
module.exports = API;

contextBridge.exposeInMainWorld("electronAPI", API);
