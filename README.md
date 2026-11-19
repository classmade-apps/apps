# Classmade apps

**Small classroom tools. Yours to make your own.**

Classmade builds small, free tools around real classroom problems. A recurring bit of busywork, a smoother routine, or one focused practice activity can be a good starting point. We choose ideas with a useful, manageable first version.

This repository holds the code for those tools. Teachers can use them as they are, change them for their classroom, or share their own versions. Each app has its own folder and instructions.

**Website: [classmade.org](https://classmade.org) — coming soon.** The website will bring together the app library and a place for teachers to suggest problems to solve. Until it launches, use the downloads and instructions here.

## First app

| App | What it does | Get started |
| --- | --- | --- |
| [Classroom timer](classroom-timer/) | A calm countdown for reading, group work, and transitions, with optional sound and fullscreen. | [Instructions and customization](classroom-timer/README.md) |

## Use a tool without coding

1. Open the app’s folder and follow its README.
2. Download its `index.html` file using GitHub’s **Download raw file** button. Alternatively, select **Code → Download ZIP** on this repository and extract the ZIP.
3. Open that HTML file in your browser. The classroom timer needs no account, installation, or internet connection once downloaded.

GitHub’s file view shows source code, not the running app. Download the file and open it locally to use it.

## Make it yours

The timer includes its full source in one downloadable file, with clearly marked settings for the default activity, duration, presets, and color. For bigger changes, fork this repository or work with the separate source files in the app folder.

Developers can run the checks with Node.js 22 or newer; there are no package dependencies to install:

```sh
npm test
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow. No Cloudflare account, backend, API key, or student information is needed to run these tools.

## Ideas and feedback

For now, [open an issue](https://github.com/classmade-apps/apps/issues) with the task you’re trying to complete, your current workaround, and the smallest improvement that would help. For a bug, include what you did, what you expected, and what happened instead.

GitHub issues are public. Please don’t include student names, email addresses, grades, or other private information. Once the website launches, its idea form will also offer optional private contact details for follow-up.

Submitting an idea does not guarantee a build or a delivery date. Whole-school systems and full learning platforms are outside this project’s scope.

## License

[MIT](LICENSE). Use, change, and share the tools; keep the included copyright and license notice with copies of the code. You don’t need to contribute changes back to use your own version.
