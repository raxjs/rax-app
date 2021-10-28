# `plugin-universal-ssr`

## API

### renderWithContext

Render the whole page and send the result by `ctx.response.send`.

Params: 
* ctx: the http request context
* options(optional)
  * initialProps: if pass the initial props, it will use `initialProps` instead of call `Page.getInitialProps`

```js
await renderWithContext(ctx, {
  initialProps: {}
});
```

### renderPageToHtml

Render page component to html string.

Params
* initialProps(optional): initial props for rendering page.

```js
const html = await renderPageToHtml({
  index: 1,
});
```

### renderDocumentToHtml

Render document component to html string.

Params
* initialProps(optional): initial props for rendering page.

```js
const html = await renderDocumentHtml({
  index: 1,
});
```