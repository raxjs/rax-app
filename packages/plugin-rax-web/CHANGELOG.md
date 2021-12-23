# Changelog

## v2.0.1

- Fix: static export error

## v2.0.0

- Feat: upgrade dependencies for webpack 5
- Feat: use `runApp` as MPA default render trigger

## v1.4.8

- Fix: `publicPath` in document

## v1.4.7

- Fix: inject publicPath in development mode

## v1.4.6

- Fix: document live load
- Feat: support sdk combo

## v1.4.5

- Fix: throw document build error

## v1.4.4

- Fix: `doctype: null`

## v1.4.3

- Chore: optimize hot reload experience

## v1.4.2

- Fix: MPA should build success without `src/app.ts`

## v1.4.1

- Fix: `rax.setDocument` for PHA

## v1.4.0

- Fix: csr html structure error with xtpl

## v1.3.10

- Feat: support build tabBar page

## v1.3.9

- Fix: windows error with document

## v1.3.8

- Fix: rax render won't override original content with initialHTML is undefined

## v1.3.7

- Chore: ensure builtin scripts load order
- Chore: remove comment node without ssr

## v1.3.6

- Fix: document hot reload
- Chore: add root node default comment placeholder for ssr

## v1.3.5

- Fix: web dev server content base

## v1.3.4

- Fix: SPA with document is invalid
- Fix: document dev shouldn't block when hot reload
- Chore: dev server should be applied to every webpack config

## v1.3.3

- Fix: insert links in app.json

## v1.3.2

- Fix: generate html when insert extra scripts
- Fix: static export code spell

## v1.3.1

- Fix: receive params passed by DEF plugin

## v1.3.0

- Refactor: document
- Feat: support config `hash` in build.json
