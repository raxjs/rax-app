const remarkAbstract = require("remark");
const colors = require("chalk");
const fs = require("fs-extra");

const remark = remarkAbstract();

/**
 * Parse demo markdown
 * @param name
 * @param content
 * @param filePath
 * @returns { Object } result { meta: {name, order, title, desc } }
 */
module.exports = (name, content, filePath) => {
  const result = {
    meta: {
      name,
    },
    js: null,
    css: null,
    html: null,
  };

  if (!content) {
    content = fs.readFileSync(filePath).toString();
  }

  if (!content) return result;

  const AST = remark.parse(content);

  if (!AST || !AST.children) {
    colors.yellow(`Can not parse the demo markdown file at: ${filePath}`);
    return result;
  }

  // code
  const body = AST.children;

  const jsNode = body.find(
    child =>
      child.type === "code" && (child.lang === "js" || child.lang === "jsx"),
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

  return result;
};
