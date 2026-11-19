import { readFile, writeFile } from 'node:fs/promises';
import { renderLessonTimer } from './render-lesson-timer.mjs';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [page, styles, scripts, license] = await Promise.all([
  read('src/template.html'),
  Promise.all(['styles.css', 'home.css', 'lesson-timer.css'].map(file => read('src/' + file))),
  Promise.all(['timer-model.js', 'lesson-timer-model.js', 'timer-chime.js', 'lesson-timer.js'].map(file => read('src/' + file))),
  read('../LICENSE'),
]);

await writeFile(new URL('index.html', import.meta.url), renderLessonTimer({ page, styles, scripts, license }));
console.log('Built lesson-timer/index.html.');
