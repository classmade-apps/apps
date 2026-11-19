import { readFile, writeFile } from 'node:fs/promises';
const base = new URL('./', import.meta.url);
const read = (path) => readFile(new URL(path, base), 'utf8');
const [template, styles, config, model, controller] = await Promise.all([
  'src/template.html', 'src/styles.css', 'src/timer-config.js',
  'src/timer-model.js', 'src/timer.js',
].map(read));
const script = [config, model, controller]
  .map(source => source.replace(/^import .*?;\n/gm, '').replace(/^export /gm, ''))
  .join('\n');
const html = template.replace('{{STYLES}}', () => styles).replace('{{SCRIPT}}', () => script);
await writeFile(new URL('index.html', base), html);
console.log('Built classroom-timer/index.html — open directly in your browser.');
