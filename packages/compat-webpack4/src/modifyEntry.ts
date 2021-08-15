import isWebpack4 from './isWebpack4';

interface IEntryInfo {
  entryName: string;
  entryPath: string;
  override?: boolean;
}

export default (compiler, {
  entryName,
  entryPath,
  override = true,
}: IEntryInfo) => {
  if (isWebpack4()) {
    compiler.options.entry[entryName] = entryPath;
  } else if (override) {
    compiler.options.entry[entryName] = {
      import: [
        entryPath,
      ],
    };
  } else {
    compiler.options.entry[entryName] = {
      import: [
        ...compiler.options.entry[entryName]?.import,
        entryPath,
      ],
    };
  }
};
