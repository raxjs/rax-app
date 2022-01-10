export default (content) => `if (module.hot) { module.hot.accept(); }; ${content};`;
