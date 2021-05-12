import createResolverPlugin from './createResolverPlugin';

const PLUGIN_NAME = 'ExportsFieldPlugin';

export default class ExportsFieldPlugin {
  conditionNames: Set<string>;
  constructor(options) {
    this.conditionNames = options.conditionNames || new Set();
  }
  apply(compiler) {
    const { conditionNames } = this;
    compiler.resolverFactory.hooks.resolver.for('normal').tap(PLUGIN_NAME, (resolver) => {
      resolver.hooks.resolveStep.tap(PLUGIN_NAME, (hook) => {
        hook.taps.push({
          type: 'async',
          fn: createResolverPlugin(resolver, hook, conditionNames),
          name: PLUGIN_NAME,
        });
        return hook;
      });
    });
  }
}
