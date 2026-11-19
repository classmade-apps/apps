// Keep the downloadable timer in sync with its readable source.
export function renderLessonTimer({ page, styles, scripts, license }) {
  const scriptTag = '<script type="module" src="/lesson-timer.js"></script>';
  if (!page.includes(scriptTag)) throw new Error('Missing Lesson Timer script in the page template.');

  const code = scripts
    .map(source => source.replace(/^import[ \t]+[\s\S]*?;\r?\n/gm, '').replace(/^export /gm, ''))
    .join('\n');

  return page
    // The offline copy keeps the app only: no site breadcrumb or web-page guide.
    .replace(/^ *<nav class="crumb"[^\n]*\n/m, '')
    .replace(/^ *<section class="tool-details[\s\S]*?<\/section>\r?\n/m, '')
    .replace('<!doctype html>', () => `<!doctype html>\n<!-- ${license} -->`)
    .replace(/^  <link rel="(?:stylesheet|icon)"[^>]*>\n/gm, '')
    .replace('</head>', () => `  <style>\n${styles.join('\n')}\n  </style>\n</head>`)
    .replace(/href="\/(?!\/)/g, 'href="https://classmade.org/')
    .replace(scriptTag, () => `<script>\n${code}\n  </script>`);
}
