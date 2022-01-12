export default ({ modifyUserConfig }) => {
  // disable minify to speed-up fixture builds
  modifyUserConfig('minify', process.env.__MINIFY__ === 'enabled');
  modifyUserConfig('compileDependencies', []);
}
