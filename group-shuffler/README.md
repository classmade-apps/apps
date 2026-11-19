# Group Shuffler

Make random groups, swap two students between groups, and copy or print the finished assignments.

[Open Group Shuffler on Classmade](https://classmade.org/apps/group-shuffler/) or [download the standalone HTML file](https://classmade.org/downloads/group-shuffler). Open the downloaded file in your browser to use it offline.

## Make and adjust groups

1. Choose **Student numbers** and enter your class size, or choose **Paste labels** and enter one label per line.
2. Set the number of groups and select **Shuffle groups**. Group sizes differ by at most one student.
3. Select two students in different groups to trade their places. Select **Undo swap** to reverse the last swap.
4. Use **Copy groups** or **Print groups** to keep the assignments. The roster stays in the open tab.

## Work with the source

The page template, scripts, and styles are in [src](src/). [group-shuffler-model.js](src/group-shuffler-model.js) handles shuffling and swapping, and [group-shuffler.js](src/group-shuffler.js) connects that logic to the interface.

From the repository root, run these commands with Node.js 22 or later:

```sh
npm test
npm run build
```

Open the generated [index.html](index.html) in your browser.

Licensed under the [MIT license](../LICENSE).
