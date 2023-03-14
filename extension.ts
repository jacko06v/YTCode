import * as vscode from "vscode";
import axios from "axios";
//load .env file
require("dotenv").config();


export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.search",
    async () => {
      const query = await vscode.window.showInputBox({
        prompt: "Search on YouTube",
      });
      if (query) {
        const results = await searchYouTube(query);
        const items = results.map((result, i) => ({
          label: result.snippet.title,
          detail: result.snippet.channelTitle,
          description: result.snippet.description,
          data: result.id.videoId,
        }));
        const selection = await vscode.window.showQuickPick(items);
        if (selection) {
          showVideo(selection.data);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function searchYouTube(query: string): Promise<
  { id: { videoId: string } }[] &
    {
      snippet: { title: string; description: string; channelTitle: string };
    }[]
> {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          q: query,
          part: "id,snippet",
          type: "video",
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );
    return response.data.items;
  } catch (err) {
    vscode.window.showErrorMessage("Error during the search: " + err.message);
    return [];
  }
}

async function showVideo(videoId: string): Promise<void> {
  const panel = vscode.window.createWebviewPanel(
    "YTCode",
    "YTCode",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getWebviewContent(videoId);

  panel.onDidDispose(() => {
    // Nothing to do
  });

  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "alert":
        vscode.window.showErrorMessage(message.text);
        return;
    }
  });

  function getWebviewContent(videoId: string) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>YouTube</title>
    </head>
    <body>
      <div id="player"></div>
   
      <script>
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        var player;
        function onYouTubeIframeAPIReady() {
          player = new YT.Player('player', {
            videoId: '${videoId}',
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
        }
        function onPlayerReady(event) {
          event.target.playVideo();
        }
        function onPlayerStateChange(event) {
          if (event.data == YT.PlayerState.ENDED) {
            sendMessage('Video ended');
          }
        }
        function sendMessage(text) {
          vscode.postMessage({
            command: 'alert',
            text: text
          });
        }
      </script>
    </body>
    </html>`;
  }

  return;
}
