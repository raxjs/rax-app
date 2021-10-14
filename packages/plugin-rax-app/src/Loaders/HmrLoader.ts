export default (content) => `if (module.hot) { module.hot.accept(); }; ${content}; __webpack_require__.p = process.env.BUILD_TARGET`;
