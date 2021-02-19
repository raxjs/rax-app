export default function (initialArg, ...funcs) {
  return funcs.reduce((result, currFunc) => currFunc(result), initialArg);
}
