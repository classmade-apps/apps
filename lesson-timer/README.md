# Lesson Timer

Plan a sequence of timed classroom activities and start them all with one click. Students see the current activity, time remaining, and what comes next.

[Open the Lesson Timer on Classmade](https://classmade.org/apps/lesson-timer/) or [download the standalone HTML file](https://classmade.org/downloads/lesson-timer). Open the downloaded file in your browser to use it offline.

## Run a lesson

1. Edit the activity names and durations. Use the arrows to reorder activities, or add and remove rows.
2. Choose **Start lesson** to run the whole plan. Use **Fullscreen** for a projector and **Pause**, **Resume**, or **Skip activity** when plans change.
3. Under **Activity transition sound**, choose a chime and select **Preview sound** to hear it. Sound starts off. **Reset lesson** returns you to editing.

The app saves the plan and chime setting in browser storage when available. Keep the tab open during a lesson.

## Change the source

The page template and styles are in [src](src/). The starter activities are in [lesson-timer-model.js](src/lesson-timer-model.js), and [lesson-timer.js](src/lesson-timer.js) connects the plan to the classroom display.

From the repository root, run these commands with Node.js 22 or later:

```sh
npm test
npm run build
```

Open the generated [index.html](index.html) in a browser. Rebuild it whenever the source changes.

Licensed under the [MIT license](../LICENSE).
