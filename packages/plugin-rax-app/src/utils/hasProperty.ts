export default function hasProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
