import { readFile, writeFile } from 'node:fs/promises';
import { renderStandaloneApp } from '../shared/render-standalone-app.mjs';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [page, styles, scripts, license] = await Promise.all([
  read('src/template.html'),
  Promise.all(['styles.css', 'home.css', 'group-shuffler.css'].map(file => read('src/' + file))),
  Promise.all(['dom.js', 'group-shuffler-model.js', 'group-shuffler.js'].map(file => read('src/' + file))),
  read('../LICENSE'),
]);

await writeFile(new URL('index.html', import.meta.url),
  renderStandaloneApp({ page, styles, scripts, license, entry: '/group-shuffler.js' }));
console.log('Built group-shuffler/index.html.');
