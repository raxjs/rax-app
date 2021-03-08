export default function () {
  return `const { getESLintConfig } = require('@iceworks/spec');

module.exports = getESLintConfig('rax');
  `;
}
