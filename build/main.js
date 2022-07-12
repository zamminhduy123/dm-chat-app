"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a = require("electron"), app = _a.app, BrowserWindow = _a.BrowserWindow, ipcMain = _a.ipcMain, dialog = _a.dialog;
var path = require("path");
var download = require("./download").download;
var isDev = process.env.NODE_ENV === "development";
var port = 3000;
var selfHost = "http://localhost:".concat(port);
var homeWindow, photoView;
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
    photoView.webContents.once("dom-ready", function () {
        photoView.webContents.send("photo-view-ready", imageMessage);
    });
    photoView.loadURL("file://".concat(path.join(__dirname, "../build/photo-view.html")));
    // Open the DevTools.
    if (isDev) {
        photoView.webContents.openDevTools();
    }
    photoView.on("closed", function () {
        photoView = null;
    });
}
function createHomeWindow() {
    var _this = this;
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
    ipcMain.on("download", function (event, _a) {
        var payload = _a.payload;
        return __awaiter(_this, void 0, void 0, function () {
            var defaultPath, defaultFilename, customUrl, filePath, directory, onProgress, onComplete;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("PAYLOAD", payload);
                        defaultPath = app.getPath(payload.directory ? payload.directory : "documents");
                        defaultFilename = payload.name
                            ? payload.name
                            : payload.fileUrl.split("?")[0].split("/").pop();
                        customUrl = dialog.showSaveDialogSync({
                            defaultPath: "".concat(defaultPath, "/").concat(defaultFilename),
                        });
                        if (!customUrl) return [3 /*break*/, 2];
                        filePath = customUrl.split("/"), directory = filePath.join("/");
                        onProgress = function (progress) {
                            homeWindow.webContents.send("download-progress", {
                                progress: progress,
                                id: payload.id,
                            });
                            homeWindow.setProgressBar(progress);
                        };
                        onComplete = function (item) {
                            homeWindow.webContents.send("download-complete", {
                                item: item,
                                id: payload.id,
                            });
                            homeWindow.setProgressBar(0, payload.id);
                        };
                        return [4 /*yield*/, download(payload.fileUrl, directory, onComplete, onProgress)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 2];
                    case 2: return [2 /*return*/];
                }
            });
        });
    });
    ipcMain.on("view-photo", function (event, _a) {
        var payload = _a.payload;
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                createPhotoView(payload.imageMessage);
                return [2 /*return*/];
            });
        });
    });
    homeWindow.loadURL(isDev ? selfHost : "file://".concat(path.join(__dirname, "../build/index.html")));
    //Open the DevTools.
    if (isDev) {
        homeWindow.webContents.openDevTools();
    }
    // Emitted when the window is closed.
    homeWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(function () {
    createHomeWindow();
    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0)
            createHomeWindow();
    });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin")
        app.quit();
});
