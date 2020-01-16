/**
 * Deep merge objects
 */
function merge(to, from) {
  if (typeof to !== "object" || typeof from !== "object") return to;

  const fromKeys = Object.keys(from);
  for (const key of fromKeys) {
    const fromValue = from[key];
    const fromType = typeof fromValue;
    const isFromArray = +Array.isArray(fromValue);
    const toValue = to[key];
    const toType = typeof toValue;
    const isToArray = +Array.isArray(toValue);

    // eslint-disable-next-line no-bitwise
    if (fromType !== toType || isFromArray ^ isToArray) {
      // Different types
      to[key] = fromValue;
    } else {
      // The same type
      // eslint-disable-next-line no-lonely-if
      if (isFromArray) {
        fromValue.forEach(item => toValue.push(item));
      } else if (fromType === "object") {
        to[key] = merge(toValue, fromValue);
      } else {
        to[key] = fromValue;
      }
    }
  }

  return to;
}

module.exports = merge;
