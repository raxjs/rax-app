## Changelog

### 3.4.4 (March 17 2021)

- Chore: update typescript/ts-loader version
- Fix: pha dev mode error without pha-worker.js
- Refactor: ssr html parser

### 3.4.2 (March 09 2021)

- Feat: support multiple pages in PHA
- Fix: SPA with document is invalid
- Fix: document dev shouldn't block when hot reload
- Fix: `.ts` file won't add babel JSX compiler
- Chore: dev server should be applied to every webpack config

### 3.4.1 (March 04 2021)

- Chore: update sass-loader
- Chore: change data prefetch key in PHA
- Fix: html generate in document mode

### 3.3.9 (February 26 2021)

- Fix: receive params passed by DEF plugin

### 3.3.8 (February 26 2021)

- Refactor: document. ([#618](https://github.com/raxjs/rax-app/pull/618))
- Fix: app json content watch. ([#612](https://github.com/raxjs/rax-app/pull/612))
- Fix: data prefetches do not decamelize in PHA. ([#616](https://github.com/raxjs/rax-app/pull/616))

### 3.3.7 (February 20 2021)

- Feat: PHA cross slide. ([#601](https://github.com/raxjs/rax-app/pull/601) [alibaba/ice#4059](https://github.com/alibaba/ice/pull/4059))
- Feat: watch app.json change. ([#601](https://github.com/raxjs/rax-app/pull/601))
- Refactor: SSR without cheerio. ([#607](https://github.com/raxjs/rax-app/pull/607))
- Fix: escape problem during HTML generation. ([#607](https://github.com/raxjs/rax-app/pull/607))
- Fix: browser history in MPA. ([#608](https://github.com/raxjs/rax-app/pull/608))
- Fix: react alias with DEF plugin. ([#605](https://github.com/raxjs/rax-app/pull/605))

### 3.2.5 (January 07 2021)

- Feat: Support PHA template.
- Feat: Wechat Miniprogram support `generator` syntactic suga.
- Chore: `runApp` add type prompt.
- Chore: PHA support without pha-worker.js
- Fix: SSR build error.

### 3.2.2 (December 29 2020)

- Fix: mpa insert all page bundle into html.

### 3.2.1 (December 25 2020)

- Chore: `compileDependencies` default value is `['']`. 

### 3.2.0 (December 24 2020)

- Feat: config store runtime automatically. ([alibaba/ice#3932](https://github.com/alibaba/ice/pull/3932))
- Feat: support config hydrate in rax-app. ([alibaba/ice#3918](https://github.com/alibaba/ice/pull/3918) [#548](https://github.com/raxjs/rax-app/pull/548))
- Feat: support set webpackLoaders and webpackPlugins through build.json.([alibaba/ice#3938]((https://github.com/alibaba/ice/pull/3938)))
- Feat: support build without `src/document/index.tsx`. ([#546](https://github.com/raxjs/rax-app/pull/546))
- Feat: support cloud IDE.([#542]((https://github.com/raxjs/rax-app/pull/542)))
- Feat: miniapp subPackage.
- Chore: `compileDependencies` default value is `[]`. ([#548]((https://github.com/raxjs/rax-app/pull/548)))
- Chore: TerserPlugin will remove unused code. ([#548]((https://github.com/raxjs/rax-app/pull/548)))
- Fix: kraken mpa error.([#541]((https://github.com/raxjs/rax-app/pull/541)))

### 3.1.2 & 3.1.3 (December 15 2020)

For v3.1.1 patch version.
### 3.1.1 (December 14 2020)

- Feat: support use name specifies MPA page name and output path.([alibaba/ice#3906](https://github.com/alibaba/ice/pull/3906))
- Feat: support set html info by app.json.([#525](https://github.com/raxjs/rax-app/pull/525))
- Feat: support snapshot in Web and optimize build PHA.([#516](https://github.com/raxjs/rax-app/pull/516))

### 3.1.0 (December 04 2020)

- Feat: support build pha app.([#507](https://github.com/raxjs/rax-app/pull/507))
- Feat: support use `--dev-targets` specified build targets in development.([#508](https://github.com/raxjs/rax-app/pull/508))
- Feat: support http request mock.([#506](https://github.com/raxjs/rax-app/pull/506))
- Fix: emit error when eslint-loader found lint problems.([alibaba/ice#3860](https://github.com/alibaba/ice/pull/3860))
- Fix: types and `APP_MODE` export.([alibaba/ice#3863](https://github.com/alibaba/ice/pull/3863) [alibaba/ice#3886](https://github.com/alibaba/ice/pull/3886))
- Fix: `withPageLifeCycle` makes `componentWillUnmount` invalid and `runApp({ app: { onShareAppMessage() {} } })` is invalid.([alibaba/ice#3880](https://github.com/alibaba/ice/pull/3880) [alibaba/ice#3890](https://github.com/alibaba/ice/pull/3890))

### 3.0.9 (November 23, 2020)

- Feat: support CSS Modules.([#488](https://github.com/raxjs/rax-app/pull/488)) 
- Refactor: change mpa entry to `.rax` temp dir.([alibaba/ice#3825](https://github.com/alibaba/ice/pull/3825))
- Fix: user couldn't custom `outputDir`.([#494](https://github.com/raxjs/rax-app/pull/494))
- Feat: support config `sourceMap` and `minify` when dev mode.([alibaba/ice#3825](https://github.com/alibaba/ice/pull/3835) [raxjs/miniapp](https://github.com/raxjs/miniapp/pull/45))
- Feat: support dashed page name.([alibaba/ice#3824](https://github.com/alibaba/ice/pull/3824))
- Fix:  duplicated taskname when both ali and wechat are compiled.([#487](https://github.com/raxjs/rax-app/pull/487))
- Fix: compact react plugin targets is undefined.([#490](https://github.com/raxjs/rax-app/pull/490))

### 3.0.8 (November 13, 2020)

- Fix: mpa restart logic.([#3817](https://github.com/alibaba/ice/pull/3817))
- Fix: kraken error.([#3817](https://github.com/alibaba/ice/pull/3817))

### 3.0.7 (November 12, 2020)

- Feat: support manually close store.([#3750](https://github.com/alibaba/ice/pull/3750))
- Feat: support pages that are not in the `src/pages`.([#3750](https://github.com/alibaba/ice/pull/3750))
- Feat: use `polyfill` field instead of `injectBabel` that can add polyfill by usage.([#3777](https://github.com/alibaba/ice/pull/3777))
- Feat: add `eslint-reporting-webpack-plugin` for dev mode.([#3771](https://github.com/alibaba/ice/pull/3771))
- Feat: support use miniapp compile mode in its runtime mode project.([#3766](https://github.com/alibaba/ice/pull/3766))
- Feat: add rax-platform-loader.([raxjs/rax-scripts#480](https://github.com/raxjs/rax-scripts/pull/480))
- Fix: `miniapp-native` dir copy logic.([#3761](https://github.com/alibaba/ice/pull/3761))
- Fix: error when set `ssr: true`.([#3775](https://github.com/alibaba/ice/pull/3775))
- Chore: remove rax-compile-config.([raxjs/rax-scripts#480](https://github.com/raxjs/rax-scripts/pull/480))
- Chore: use `react-dev-utils/webpackHotDevClient` instead of `rax-compile-config/hmr`.([#3806](https://github.com/alibaba/ice/pull/3806))
- Chore: change polyfill load settings.([raxjs/rax-scripts#480](https://github.com/raxjs/rax-scripts/pull/475))
- Chore: update mini-css-extract-plugin version and set `esModule` to `false` as default.([raxjs/rax-scripts#475](https://github.com/raxjs/rax-scripts/pull/475))
- Chore: unify the packaging mechanism of icejs and rax-app.([#3753](https://github.com/alibaba/ice/pull/3753))
- Chore: change `compileDependencies` default value to `['']`.([#3802](https://github.com/alibaba/ice/pull/3802))
- Enhance: open browser logic, now you can use ` -- --mpa-entry=home` to specify mpa entry.([#3798](https://github.com/alibaba/ice/pull/3798))
- Docs: update router and change `compileDependencies` related docs.([raxjs/docs#42](https://github.com/raxjs/docs/pull/42)
)



### 3.0.6 (October 30, 2020)

- Feat: support browser history for web.([#3736](https://github.com/alibaba/ice/pull/3736))
- Fix: windows path error.([#3695](https://github.com/alibaba/ice/pull/3695))
- Fix: kraken/weex assets couldn't find.([#3736](https://github.com/alibaba/ice/pull/3736))
- Enhance: format debug info.([#3736](https://github.com/alibaba/ice/pull/3736))
- Feat: support miniapp compile config.([#3730](https://github.com/alibaba/ice/pull/3730))

