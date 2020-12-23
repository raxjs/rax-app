export default function getBuiltInHtmlTpl(htmlInfo) {
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
