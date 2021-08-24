export default function (relativePath) {
  let lastNonSlashIndex = 2;
  let slashIndex = relativePath.indexOf('/', 2);
  let cd = 0;

  while (slashIndex !== -1) {
    const folder = relativePath.slice(lastNonSlashIndex, slashIndex);

    switch (folder) {
      case '..': {
        cd--;
        if (cd < 0) return new Error(`Trying to access out of package scope. Requesting ${relativePath}`);
        break;
      }
      default:
        cd++;
        break;
    }

    lastNonSlashIndex = slashIndex + 1;
    slashIndex = relativePath.indexOf('/', lastNonSlashIndex);
  }
}
