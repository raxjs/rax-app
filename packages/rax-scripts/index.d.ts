declare namespace RaxScripts {
    type LifeCycle = 'before.dev' | 'after.dev' | 'after.devCompile' | 'before.dev' | 'after.build'
  
    interface PluginAPI {
      command: string;
      commandArgs: string;
      rootDir: string;
      userConfig: { [key: string]: any };
      pkg: { [key: string]: any };
      registerConfig: any;
      chainWebpack: any;
      onHook: (hook: LifeCycle, callback: (options: any) => void) => void;
    }
  
    type RaxPlugin<T = any> = (pluginAPI: PluginAPI, options: T) => void;
  }
  