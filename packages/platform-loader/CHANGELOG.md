# Changelog

## v1.1.2 beta

- Feat: support xhs-miniapp isXhsMiniApp
- Feat: support user platformMap, excludePlatformMap
- Feat: support loaderOptions.memberExpObjName
- Fix: Restrict the scope of MemberExpression, don't touch _xxxEnv.isIOS|isTaoBao|UA|appName, just handle env variables in platformMaps
- Fix: don't insert isWeex when import { isWeex as xxx } from 'universal-env'
- Fix: await SourceMapConsumer and destroy
- Perf: add hasPlatformContent check, avoid babel ast visit useless
- Refactor: rm unused transform O.p = true|false

## v1.1.1

- Fix: not match platform error

## v1.1.0

- Feat: support judge env of 'bytedance-microapp', 'kuaishou-miniprogram' and 'baidu-smartprogram'

## v1.0.2

- Fix: `.ts` file won't add babel JSX compiler
