export default function stringifyLoaders(loaders) {
  return loaders.map((loader) => {
    if (typeof loader === 'string') {
      return loader;
    } else {
      const { name } = loader;
      const query = [];
      if (loader.query) {
        // eslint-disable-next-line guard-for-in
        for (const k in loader.query) {
          const v = loader.query[k];
          if (v != null) {
            if (v === true) {
              query.push(k);
            } else if (v instanceof Array) {
              query.push(`${k}[]=${v.join(',')}`);
            } else {
              query.push(`${k}=${v}`);
            }
          }
        }
      }
      return `${name}${query.length ? (`?${ query.join('&')}`) : ''}`;
    }
  }).join('!');
}
