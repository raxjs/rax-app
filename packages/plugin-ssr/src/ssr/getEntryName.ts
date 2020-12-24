/**
 * Generate entryname by route.path
 * Example: '/about/' -> 'about/index'
 */
export default (path) => {
  let entryName = 'index';

  if (path && path !== '/') {
    entryName = `${path.replace(/^\/|\/$/g, '')}/index`;
  }

  return entryName;
};
