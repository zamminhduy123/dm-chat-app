const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
} = require("electron");
const path = require("path");
const { download } = require("./download");

console.log(process.env);

const isDev = process.env.NODE_ENV === "development";
console.log(isDev);
const port = 3000;
const selfHost = `http://localhost:${port}`;

let currentNotification;

let homeWindow, photoView;

function createPhotoView(imageMessage) {
  // Create the browser window.
  photoView = new BrowserWindow({
    width: 930,
    height: 630,
    title: "Application is currently initializing...",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  photoView.webContents.once("dom-ready", () => {
    photoView.webContents.send("photo-view-ready", imageMessage);
  });

  photoView.loadURL(
    `file://${path.join(__dirname, "../build/photo-view.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    photoView.webContents.openDevTools();
  }

  photoView.on("closed", () => {
    photoView = null;
  });

  if (!isDev) photoView.setMenu(null);
}

function showNotification(title, body) {
  if (currentNotification) {
    currentNotification.close();
    currentNotification = new Notification({
      title: title,
      body: body,
      icon: "icon.ico",
    });
    currentNotification.show();
  } else {
    currentNotification = new Notification({
      title: title,
      body: body,
      icon: "icon.ico",
    });
    currentNotification.show();
  }
}
function createHomeWindow() {
  // Create the browser window.
  homeWindow = new BrowserWindow({
    width: 1500,
    height: 930,
    title: "Application is currently initializing...",
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // if (!isDev) homeWindow.setMenu(null);
  ipcMain.on("download", async (event, { payload }) => {
    console.log("PAYLOAD", payload);
    // await homeWindow.webContents.downloadURL(payload.fileUrl);
    const defaultPath = app.getPath(
      payload.directory ? payload.directory : "documents"
    );

    const defaultFilename = payload.name
      ? payload.name
      : payload.fileUrl.split("/").pop();

    let customUrl = dialog.showSaveDialogSync({
      defaultPath: `${defaultPath}/${defaultFilename.split(".")[0]}`,
    });
    let ext = defaultFilename.split(".")[1];
    if (customUrl) {
      let filePath = customUrl.split("/"),
        directory = filePath.join("/") + "." + ext;

      const onProgress = (progress) => {
        homeWindow.webContents.send("download-progress", {
          progress,
          id: payload.id,
        });
        homeWindow.setProgressBar(progress);
      };
      const onComplete = (item) => {
        homeWindow.webContents.send("download-complete", {
          item,
          id: payload.id,
        });
        homeWindow.setProgressBar(0, payload.id);
      };
      download(payload.fileUrl, directory, onComplete, onProgress);
    } else {
      /**download cancel */
    }
  });
  ipcMain.on("view-photo", async (event, { payload }) => {
    createPhotoView(payload.imageMessage);
  });

  ipcMain.on("new-noti", async (event, { payload }) => {
    showNotification(payload.title, payload.message);
  });

  homeWindow.loadURL(
    isDev ? selfHost : `file://${path.join(__dirname, "../build/index.html")}`
  );

  //Open the DevTools.
  if (isDev) {
    homeWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  homeWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createHomeWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createHomeWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
