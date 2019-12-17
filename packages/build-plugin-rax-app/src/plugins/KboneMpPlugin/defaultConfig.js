module.exports = {
  origin: "",
  entry: "/",
  router: {
    index: ["/"]
  },
  redirect: {
    notFound: "none",
    accessDenied: "none"
  },
  generate: {
    autoBuildNpm: true
  },
  app: {
    navigationBarTitleText: "Rax App 1.0"
  },
  appExtraConfig: {},
  global: {
    rem: true,
    pageStyle: true,
    extra: {}
  },
  pages: {},
  optimization: {
    styleValueReduce: 5000,
    attrValueReduce: 5000
  },
  projectConfig: {},
  packageConfig: {}
};
