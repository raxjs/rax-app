# Changelog

## v2.0.4

- Chore: update `parse-url` to v6
- Fix: inject configured scripts

## v2.0.3

- Fix: remove comment node

## v2.0.2

- Fix： override `ctx`

## v2.0.1

- Fix: chunkInfo is `undefined`
- Fix: close hot with ssr

## v2.0.0

- Feat: upgrade dependencies for webpack 5
- Feat: use `runApp` as MPA default render trigger

## v1.3.12

- Feat: escape data to prevent xss

## v1.3.11

- Feat: support sdk combo

## v1.3.10

- Fix: pass context when generate html

## v1.3.9

- Feat: transform static node to html tag directly
- Fix: read file content from compiler memfs

## v1.3.8

- Feat: support query is `csr=true` with request path end is `.html`, devServer will return CSR result

## v1.3.7

- Feat: add `props.pageConfig` in Rax App SSR page component

## v1.3.6

- Chore: only remove comment node with build command
- Chore: change `injectServerSideData` to `updateDataInClient`

## v1.3.5

- - Chore: remove comment node when ssr compiled

## v1.3.4

- Chore: @builder/html-generator break change

## v1.3.3

- Fix: compatible `request.search` without default value

## v1.3.2

- Chore: it won't execute original dev server

## v1.3.1

- Feat: add `injectServerSideData` in app.json
- Fix: ssr initial props can be null

## v1.3.0

- Feat: support config `hash` in build.json
