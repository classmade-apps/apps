import { readFile, writeFile } from 'node:fs/promises';
import { renderStandaloneApp } from '../shared/render-standalone-app.mjs';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [page, styles, scripts, license] = await Promise.all([
  read('src/template.html'),
  Promise.all(['styles.css', 'home.css', 'cleanup-cue.css'].map(file => read('src/' + file))),
  Promise.all(['timer-model.js', 'cleanup-cue-model.js', 'cleanup-cue-sound.js', 'cleanup-cue.js'].map(file => read('src/' + file))),
  read('../LICENSE'),
]);

await writeFile(new URL('index.html', import.meta.url),
  renderStandaloneApp({ page, styles, scripts, license, entry: '/cleanup-cue.js' }));
console.log('Built cleanup-cue/index.html.');
