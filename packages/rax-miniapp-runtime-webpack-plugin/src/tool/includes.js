/**
 * Judge whether parentArr includes childArr
 */
function includes(parentArr, childArr) {
  for (const child of childArr) {
    if (parentArr.indexOf(child) === -1) return false;
  }

  return true;
}

module.exports = includes;
