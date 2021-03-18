import { IHtmlInfo } from '../types';

let scripts = [];
let links = [];
let metas = [];

export function addSpmA(spmA) {
  if (!spmA) return '';
  return `<meta name="data-spm" content="${spmA}" />`;
}

export function addSpmB(spmB) {
  if (!spmB) return '';
  return `data-spm="${spmB}"`;
}

export function addStaticSource(sources: string[]) {
  return sources.reduce((prev, current) => `${prev}${current}\n`, '');
}

export function addScriptsBySource(sources: string[]) {
  return sources.reduce(
    (prev, current) =>
      `${prev}${`<script crossorigin="anonymous" type="application/javascript" src="${current}"></script>`}\n`,
    '',
  );
}

export function addLinksBySource(sources: string[]) {
  return sources.reduce((prev, current) => `${prev}${`<link rel="stylesheet" href="${current}" />`}\n`, '');
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

export function getBuiltInHtmlTpl(htmlInfo: IHtmlInfo, ssr: boolean) {
  const {
    doctype,
    title,
    spmA,
    spmB,
    injectedHTML: { links: customLinks = [], scripts: customScripts = [], metas: customMetas = [] },
    assets: { links: assetLinks = [], scripts: assetScripts = [] },
  } = htmlInfo;

  let { initialHTML = '' } = htmlInfo;

  if (ssr) {
    initialHTML = '<!--__INNER_ROOT__-->';
  }
  return `
  ${doctype}
  <html>
    <head>
      <meta charset="utf-8" />
      ${addSpmA(spmA)}
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover" />
      ${addStaticSource(customMetas)}
      <title>${title}</title>
      ${addStaticSource(customLinks)}
      ${addLinksBySource(assetLinks)}
    </head>
    <body ${addSpmB(spmB)}>
      ${ ssr ? '<!--__BEFORE_ROOT__-->' : '' }
      <div id="root">${initialHTML}</div>
      ${addStaticSource(customScripts)}
      ${ ssr ? '<!--__AFTER_ROOT__-->' : '' }
      ${addScriptsBySource(assetScripts)}
    </body>
  </html>
`;
}

export function insertScripts(customScripts) {
  scripts = [...scripts, ...customScripts];
}

export function insertLinks(customLinks) {
  links = [...links, ...customLinks];
}

export function insertMetas(customMetas) {
  metas = [...metas, ...customMetas];
}

export function insertScriptsByInfo(customScripts) {
  insertScripts(
    customScripts.map((scriptInfo) => {
      const attrStr = Object.keys(scriptInfo).reduce((curr, next) => `${curr} ${next}="${scriptInfo[next]}" `, '');
      return `<script${attrStr}></script>`;
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
