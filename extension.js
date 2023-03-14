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
exports.__esModule = true;
exports.activate = void 0;
var vscode = require("vscode");
var axios_1 = require("axios");
function activate(context) {
    var _this = this;
    var disposable = vscode.commands.registerCommand("extension.search", function () { return __awaiter(_this, void 0, void 0, function () {
        var query, results, items, selection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.showInputBox({
                        prompt: "Search on YouTube"
                    })];
                case 1:
                    query = _a.sent();
                    if (!query) return [3 /*break*/, 4];
                    return [4 /*yield*/, searchYouTube(query)];
                case 2:
                    results = _a.sent();
                    items = results.map(function (result, i) { return ({
                        label: result.snippet.title,
                        detail: result.snippet.channelTitle,
                        description: result.snippet.description,
                        data: result.id.videoId
                    }); });
                    return [4 /*yield*/, vscode.window.showQuickPick(items)];
                case 3:
                    selection = _a.sent();
                    if (selection) {
                        showVideo(selection.data);
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function searchYouTube(query) {
    return __awaiter(this, void 0, void 0, function () {
        var response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1["default"].get("https://www.googleapis.com/youtube/v3/search", {
                            params: {
                                q: query,
                                part: "id,snippet",
                                type: "video",
                                maxResults: 10,
                                key: "AIzaSyBz31S67Too5ho8KXEnasvgI4j1A4wvGAY"
                            }
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.items];
                case 2:
                    err_1 = _a.sent();
                    vscode.window.showErrorMessage("Error during the search: " + err_1.message);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function showVideo(videoId) {
    return __awaiter(this, void 0, void 0, function () {
        function getWebviewContent(videoId) {
            return "<!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n      <meta charset=\"UTF-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n      <title>YouTube</title>\n    </head>\n    <body>\n      <div id=\"player\"></div>\n   \n      <script>\n      var tag = document.createElement('script');\n\n      tag.src = \"https://www.youtube.com/iframe_api\";\n      var firstScriptTag = document.getElementsByTagName('script')[0];\n      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);\n        var player;\n        function onYouTubeIframeAPIReady() {\n          player = new YT.Player('player', {\n            videoId: '".concat(videoId, "',\n            events: {\n              'onReady': onPlayerReady,\n              'onStateChange': onPlayerStateChange\n            }\n          });\n        }\n        function onPlayerReady(event) {\n          event.target.playVideo();\n        }\n        function onPlayerStateChange(event) {\n          if (event.data == YT.PlayerState.ENDED) {\n            sendMessage('Video ended');\n          }\n        }\n        function sendMessage(text) {\n          vscode.postMessage({\n            command: 'alert',\n            text: text\n          });\n        }\n      </script>\n    </body>\n    </html>");
        }
        var panel;
        return __generator(this, function (_a) {
            panel = vscode.window.createWebviewPanel("YTCode", "YTCode", vscode.ViewColumn.Two, {
                enableScripts: true
            });
            panel.webview.html = getWebviewContent(videoId);
            panel.onDidDispose(function () {
                // Nothing to do
            });
            panel.webview.onDidReceiveMessage(function (message) {
                switch (message.command) {
                    case "alert":
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            });
            return [2 /*return*/];
        });
    });
}
