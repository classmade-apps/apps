# Cleanup Cue

Set a bell time and give the class a visual countdown and audible cue when it’s time to start cleaning up.

[Open Cleanup Cue on Classmade](https://classmade.org/apps/cleanup-cue/) or [download the standalone HTML file](https://classmade.org/downloads/cleanup-cue). Open the downloaded file in your browser to use it offline.

## Set a cleanup cue

1. Set **Bell time** and **Minutes early**. A 2:45 p.m. bell with two minutes of cleanup gives a cue at 2:43 p.m.
2. Open **Cue sound** to preview either sound or switch to a visual cue.
3. Select **Start cue** and keep the tab open and the device awake. For a projector, choose **Fullscreen**.
4. Use **Repeat on weekdays** to keep one bell time running Monday through Friday. After opening a fresh tab or reloading, select **Start cue** again.

The schedule uses the device’s clock. The bell time, lead, repeat setting, and sound choice stay in the browser when storage is available.

## Work with the source

The page template, styles, and scripts are in [src](src/). [cleanup-cue-model.js](src/cleanup-cue-model.js) handles scheduling. [cleanup-cue-sound.js](src/cleanup-cue-sound.js) defines the audible signals.

From the repository root with Node.js 22 or later:

```sh
npm test
npm run build
```

Open the generated [index.html](index.html) in a browser.

Licensed under the [MIT license](../LICENSE).
