const remarkAbstract = require("remark");
const colors = require("chalk");
const fs = require("fs-extra");
const marked = require("marked");
const hljs = require("highlight.js/lib/highlight");
const htmlDecode = require("js-htmlencode").htmlDecode;

const remark = remarkAbstract();

hljs.registerLanguage(
  "javascript",
  require("highlight.js/lib/languages/javascript"),
);
hljs.registerLanguage("css", require("highlight.js/lib/languages/css"));
hljs.registerLanguage("html", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("bash", require("highlight.js/lib/languages/bash"));

/**
 * Parse demo markdown
 * @param name
 * @param filePath
 * @returns { Object } result { meta: {name, order, title, desc } }
 */
module.exports = (name, filePath) => {
  const result = {
    meta: {
      name,
      order: 0,
      title: name,
    },
    js: null,
    css: null,
    html: null,
    body: null,
  };

  let content = fs.readFileSync(filePath).toString();

  if (!content) return result;

  const AST = remark.parse(content.replace(/^---(.|\n)*---/gim, ""));

  if (!AST || !AST.children) {
    colors.yellow(`Can not parse the demo md: ${filePath}`);
    return result;
  }

  // meta
  const metaReg = /---(.|\n)*---/g;
  const metaArray = content.match(metaReg);

  if (metaArray && metaArray.length > 0) {
    content = content.replace(metaReg, "");
    metaArray.forEach(metaStr => {
      if (!metaStr) return;
      metaStr = metaStr.replace(/---/g, "");
      metaStr
        .split("\n")
        .map(str => str.trim())
        .filter(str => !!str)
        .forEach(metaItemStr => {
          const index = metaItemStr.indexOf(":");

          result.meta[
            metaItemStr.substring(0, index).trim()
          ] = metaItemStr.substring(index + 1).trim();
        });
    });
  }

  // title
  const titleNode = AST.children.find(
    child => child.type === "heading" && child.depth === 1,
  );
  if (titleNode && titleNode.children && titleNode.children[0]) {
    result.meta.title = titleNode.children[0].value;
  }

  // code
  const body = AST.children;

  const jsNode = body.find(
    child => child.type === "code" && ["js", "jsx"].indexOf(child.lang) > -1,
  );
  if (jsNode) {
    result.js = jsNode.value;
  }

  const cssNode = body.find(
    child => child.type === "code" && child.lang === "css",
  );
  if (cssNode) {
    result.css = cssNode.value;
  }

  const htmlNode = body.find(
    child => child.type === "code" && child.lang === "html",
  );

  if (htmlNode) {
    result.html = htmlNode.value;
  }

  const bodyContent = body.map(child => {
    if (
      child.type === "code" &&
      ["js", "jsx", "css", "html"].indexOf(child.lang) > 0
    ) {
      return "\n";
    } else if (child.type === "code") {
      return `<pre><code>${htmlDecode(
        hljs.highlight(child.lang || "bash", child.value).value,
      )}</code></pre>`;
    } else if (!(child.type === "heading" && child.depth === 1)) {
      return marked(remark.stringify(child));
    } else {
      return "\n";
    }
  });

  if (bodyContent) {
    result.body = bodyContent.join("\n");
  }

  return result;
};
