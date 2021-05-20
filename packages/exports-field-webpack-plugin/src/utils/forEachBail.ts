export default function forEachBail(array, iterator, callback) {
  if (array.length === 0) return callback();

  let i = 0;
  const next = () => {
    let loop;
    iterator(array[i++], (err, result) => {
      if (err || result !== undefined || i >= array.length) {
        return callback(err, result);
      }
      if (loop === false) while (next());
      loop = true;
    });
    if (!loop) loop = false;
    return loop;
  };
  while (next());
}
