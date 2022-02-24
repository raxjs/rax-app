# Changelog

## v2.0.3

- Fix: remove `html` field for TabBar

## v2.0.2

- Fix: URL error when build type is Weex

## v2.0.1

- Fix: manifest.json need includes the scripts which injected by API

## v2.0.0

- Feat: upgrade dependencies for webpack 5

## v1.4.10

- Fix: inject script or stylesheet by assets

## v1.4.9

- Fix: tabHeader & tabBar logic in iOS & Android
- Fix: `publicPath` in document

## v1.4.8

- Feat: support tabHeader & tabBar template
- Feat: support config url in page & tabHeader & tabBar

## v1.4.7

- Feat: manifest json output no space in production
- Chore: white list add cacheQueryParams

## v1.4.6

- Chore: pha plugin add more white list and no decamelize keys
- Fix: no prefetch type will crash in Android TaoBao 9.26.0
- Fix: do not set script field when has frames under the page

## v1.4.5

- Fix: manifest generate stylesheet field when configure forceEnableCSS in inlineStyle to true

## v1.4.4

- Fix: keys of requestHeaders should not be transformed

## v1.4.3

- Chore: compatible with item.name in tabBar config

## v1.4.2

- Chore: add builtin library to `scripts` field
- Chore: use `web.pha.template` instead of `web.template`

## v1.4.1

- Chore: Use the `template` field directly

## v1.4.0

- Feat: support set dataPrefetch for every single page in PHA

## v1.3.2

- Feat: support build tabBar page

## v1.3.1

- Fix: pha dev error without pha-worker.js

## v1.3.0

- Feat: support multiple pages in PHA

## v1.2.5

- Chore: Change data prefetch key in PHA

## v1.2.4

- Feat: add white list for manifest and android crash

## v1.2.3

- Fix: data prefetches do not decamelize
