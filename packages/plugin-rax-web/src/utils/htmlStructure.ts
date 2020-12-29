import * as cheerio from 'cheerio';
import { IHtmlInfo } from '../types';

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
  const { metas: customMetas = [], links: customLinks = [], scripts: customScripts = [] } = staticConfig;
  if (customMetas) {
    metas = [...metas, ...customMetas];
  }
  if (customLinks) {
    links = [...links, ...customLinks];
  }
  if (customScripts) {
    scripts = [...scripts, ...customScripts];
  }
}

export function generateHtmlStructure(htmlStr, htmlInfo?: IHtmlInfo) {
  const $ = cheerio.load(htmlStr);
  const root = $('#root');
  const title = $('title');
  const { metas: pageMetas = [], links: pageLinks = [], scripts: pageScripts = [] } = htmlInfo || {};
  title.before([...metas, ...pageMetas]);
  title.after([...scripts, ...pageLinks]);
  root.after([...scripts, ...pageScripts]);
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

export function insertScriptsByInfo(customScripts) {
  insertScripts(
    customScripts.map((scriptInfo) => {
      const attrStr = Object.keys(scriptInfo).reduce((curr, next) => `${curr} ${next}=${scriptInfo[next]} `, '');
      return `<script${attrStr} />`;
    }),
  );
}

export function injectHTML(tagName, value) {
  switch (tagName) {
    case 'script':
      insertScripts(value);
      break;
    case 'link':
      insertLinks(value);
      break;
    case 'meta':
      insertMetas(value);
      break;
    default:
      throw new Error(`Not support inject ${tagName}`);
  }
}

export function getInjectedHTML() {
  return {
    scripts: [...scripts],
    links: [...links],
    metas: [...metas],
  };
}
