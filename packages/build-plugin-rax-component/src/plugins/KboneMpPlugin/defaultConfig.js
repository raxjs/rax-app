module.exports = {
  origin: "",
  entry: "/",
  router: {
    index: ["/"],
  },
  redirect: {
    notFound: "index",
    accessDenied: "index",
  },
  generate: {
    globalVars: [
      ["TEST_VAR_STRING", "'miniprogram'"],
      ["TEST_VAR_NUMBER", "123"],
      ["TEST_VAR_BOOL", "true"],
      ["TEST_VAR_FUNCTION", "function() {return 'I am function'}"],
      ["TEST_VAR_OTHERS", "window.document"],
      ["CustomEvent"],
    ],
    autoBuildNpm: "yarn",
  },
  app: {
    navigationBarTitleText: "rax-wechat-miniprogram-project",
  },
  global: {
    rem: true, 
    pageStyle: true, 
  },
  pages: {},
  optimization: {
    domSubTreeLevel: 5,

    elementMultiplexing: true,
    textMultiplexing: true,
    commentMultiplexing: true,
    domExtendMultiplexing: true,

    styleValueReduce: 5000,
    attrValueReduce: 5000,
  },
  projectConfig: {
    appid: "",
    projectname: "rax-wechat-miniprogram-project",
  },
  packageConfig: {
    author: "rax-team",
  },
};
