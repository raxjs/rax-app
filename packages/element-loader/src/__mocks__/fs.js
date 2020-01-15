export default {
  readFileSync() {
    const content = {
      presets: ['rax'],
    };
    return JSON.stringify(content);
  },
};
