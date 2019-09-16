const path = require('path');
const fs = require('fs-extra');

const log = require('./log');

const PKG_FILE = 'package.json';
const USER_CONFIG_FILE = 'build.json';

module.exports = class Context {
  constructor({
    command,
    rootDir = process.cwd(),
    args = {} }
  ) {
    this.getProjectFile = this.getProjectFile.bind(this);
    this.getUserConfig = this.getUserConfig.bind(this);
    this.getPlugins = this.getPlugins.bind(this);
    this.registerConfig = this.registerConfig.bind(this);
    this.getNamedConfig = this.getNamedConfig.bind(this);
    this.chainWebpack = this.chainWebpack.bind(this);
    this.onHook = this.onHook.bind(this);
    this.applyHook = this.applyHook.bind(this);
    this.runPlugins = this.runPlugins.bind(this);
    this.runWebpackFn = this.runWebpackFn.bind(this);
    this.getConfig = this.getConfig.bind(this);

    this.command = command;
    this.commandArgs = args;
    this.rootDir = rootDir;

    this.__configArr = []; // 配置
    this.__webpackFns = []; // 插件注册的修改函数
    this.__eventHooks = {}; // 插件注册的生命周期函数
    this.__CustomDevServer = null; // 自定义devServer

    this.pkg = this.getProjectFile(PKG_FILE);

    this.userConfig = this.getUserConfig();

    this.__plugins = this.getPlugins();
  }

  getProjectFile(fileName) {
    const configPath = path.resolve(this.rootDir, fileName);

    let config = {};
    if (fs.existsSync(configPath)) {
      try {
        config = fs.readJsonSync(configPath);
      } catch (err) {
        log.info('CONFIG', `Fail to load config file ${configPath}, use empty object`);
      }
    }

    return config;
  }

  getUserConfig() {
    const { config } = this.commandArgs;
    let configPath = '';
    if (config) {
      configPath = path.isAbsolute(config) ? config : path.resolve(this.rootDir, config);
    } else {
      configPath = path.resolve(this.rootDir, USER_CONFIG_FILE);
    }
    let userConfig = {};
    if (fs.existsSync(configPath)) {
      try {
        userConfig = fs.readJsonSync(configPath);
      } catch (err) {
        log.info('CONFIG', `Fail to load config file ${configPath}, use default config instead`);
        log.error(err);
        process.exit(1);
      }
    }

    return userConfig;
  }

  getPlugins() {
    const userPlugins = this.userConfig.plugins.map((pluginInfo) => {
      let fn = () => {};

      const plugins = Array.isArray(pluginInfo) ? pluginInfo : [pluginInfo];

      const pluginPath = require.resolve(plugins[0], { paths: [this.rootDir] });
      const options = plugins[1];

      try {
        fn = require(pluginPath); // eslint-disable-line
      } catch (err) {
        log.error(`Fail to load plugin ${pluginPath}`);
        log.error(err);
        process.exit(1);
      }

      return {
        name: pluginPath,
        fn,
        options,
      };
    });

    return userPlugins;
  }

  registerConfig(name, chainConfig) {
    chainConfig.getConfig = this.getNamedConfig;

    this.__configArr.push({
      name,
      chainConfig,
    });
  }

  getNamedConfig(name) {
    const configInfo = this.__configArr.find(v => v.name === name);
    if (!configInfo) {
      console.error(`There is no config named ${name}`)
      return;
    };
    return configInfo.chainConfig;
  }

  chainWebpack(fn) {
    const fnInfo = this.__webpackFns.find(v => v.name === this.pluginName);
    if (!fnInfo) {
      this.__webpackFns.push({
        name: this.pluginName,
        chainWebpack: [fn],
      });
    } else {
      fnInfo.chainWebpack.push(fn);
    }
  }

  onHook(key, fn) {
    if (!Array.isArray(this.__eventHooks[key])) {
      this.__eventHooks[key] = [];
    }
    this.__eventHooks[key].push(fn);
  }

  async applyHook(key, opts = {}) {
    const hooks = this.__eventHooks[key] || [];

    for (const fn of hooks) {
      await fn(opts);
    }
  }

  async runPlugins() {
    for (const pluginInfo of this.__plugins) {
      const { fn, options } = pluginInfo;

      const pluginAPI = {
        log,
        context: this,
        registerConfig: this.registerConfig,
        chainWebpack: this.chainWebpack,
        onHook: this.onHook,
      }

      await fn(pluginAPI, options);
    }
  }

  async runWebpackFn() {
    this.__webpackFns.forEach((plugins) => {
      const { chainWebpack } = plugins;
      const configApi = this.__configArr[0].chainConfig;

      chainWebpack.forEach(fn => {
        fn(configApi, {
          command: this.command,
        });
      });
    });
  }

  async getConfig() {
    await this.runPlugins();
    await this.runWebpackFn();

    return this.__configArr;
  }
};
