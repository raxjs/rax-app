export default function filterByTarget(routes, { target }) {
  return routes.filter(({ targets }) => {
    if (!targets) return true;
    return targets.includes(target);
  });
}

