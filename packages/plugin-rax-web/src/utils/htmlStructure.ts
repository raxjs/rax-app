import * as cherrio from 'cheerio';

let scripts = [];
let links = [];
let metas = [];

export function getBuiltInHtmlTpl(htmlInfo) {
  const { doctype = '<!DOCTYPE html>', title } = htmlInfo;
  return `
  ${doctype}
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover" />
      <title>${title}</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
`;
}

export function insertCommonElements(staticConfig) {
  const { metas: customMetas, links: customLinks, scripts: customScripts } = staticConfig;
  if (customMetas) {
    metas = [...metas, customMetas];
  }
  if (customLinks) {
    links = [...links, customLinks];
  }
  if (customScripts) {
    scripts = [...scripts, customScripts];
  }
}

export function generateHtmlStructure(htmlStr) {
  const $ = cherrio.load(htmlStr);
  const root = $('#root');
  const title = $('title');
  title.before(metas);
  title.after(links);
  root.after(scripts);
  return $;
}

export function insertScripts(customScripts) {
  scripts = [...scripts, customScripts];
}

export function insertLinks(customLinks) {
  links = [...links, customLinks];
}

export function insertMetas(customMetas) {
  metas = [...metas, customMetas];
}
