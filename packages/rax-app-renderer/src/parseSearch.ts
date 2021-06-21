export default function (search) {
  const results = search.substr(1).split('&');
  const query = {};
  results.forEach((result) => {
    const [key, value] = result.split('=');
    query[key] = value;
  });
  return query;
}
