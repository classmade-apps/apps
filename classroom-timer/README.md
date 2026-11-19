# Classroom timer

A calm, readable countdown for independent reading, group work, transitions, or a short thinking break.

Part of **[Classmade](https://classmade.org)** — small classroom tools, yours to make your own. Use the [classroom timer online](https://classmade.org/apps/classroom-timer/) or download a copy to run offline.

## Use it now

1. Open [index.html](index.html) on GitHub.
2. Select **Download raw file** near the top-right of the file view. If you download the repository ZIP instead, extract it first.
3. Open the downloaded `index.html` in Chrome, Edge, Firefox, or Safari.
4. Choose a duration, name the activity, and select **Start timer**.

This is a complete app in one file. It works offline after downloading. No sign-up, installation, server, or API key is required. Some school-managed devices restrict downloaded HTML; ask your school’s IT team if your browser cannot open it.

## Features

- Quick presets and custom durations from 1 second to 180 minutes.
- An editable activity name and large countdown display.
- Pause, resume, reset, and restart.
- Visual progress bar and optional two-note chime.
- Fullscreen where the browser supports it; press Escape to exit.
- Keyboard-accessible controls and reduced-motion support.

The timer stays on your device. It does not collect or send classroom information. Keep the tab open: reloading resets it. A sleeping device may delay the chime, and the sound depends on your audio settings. Changing the system clock can affect the countdown. Downloaded copies do not update automatically.

## Customize your downloaded copy

Make a backup, then open `index.html` in a plain-text or code editor. Search for **MAKE IT YOURS**. You will find:

```js
const TIMER_DEFAULTS = {
  minutes: 5,
  activity: 'Independent reading',
  presets: [1, 5, 10, 15, 25],
  accent: '#204d3d',
};
```

Change the values, keep the quotes and commas, save, and reopen the file. Defaults and preset buttons accept 1–180 minutes. Choose a dark accent color so white button labels stay readable.

For example, use `activity: 'Quiet writing'`, `minutes: 10`, and `presets: [2, 10, 20]`.

You can also ask a developer or AI coding assistant to help change the file. Describe one specific outcome and ask it to keep the app self-contained, keyboard accessible, and free of tracking. Test changes before a lesson and leave student information out of prompts.

## Work with the separate source files

| File | Purpose |
| --- | --- |
| `src/timer-config.js` | Starting activity, time, presets, and accent color |
| `src/timer-model.js` | Countdown and time formatting |
| `src/timer.js` | Controls, display, fullscreen, and sound |
| `src/styles.css` | Visual styling |
| `src/template.html` | Page layout, instructions, and license notice |
| `build.mjs` | Combines the source into the standalone `index.html` |
| `tests/timer.test.mjs` | Countdown regression tests |

From the repository root, with Node.js 22+:

```sh
npm test
npm run build
```

No dependencies need installing. After changing files under `src/`, rebuild and commit the updated `index.html` too. Direct edits to the repository’s `index.html` will be replaced by the build; edits to your personal downloaded copy are independent.

Before sharing a changed version, check start, pause/resume, reset, custom durations, time completion, sound, keyboard navigation, and the layout on your classroom display.

## Feedback and reuse

[Report a problem or suggest a small improvement](https://github.com/classmade-apps/apps/issues). Issues are public; do not include student or other private information.

Licensed under the [MIT license](../LICENSE). Keep the license notice included when sharing the app or its code.
