export default function injectBundleInfo(bundle, { html, chunkInfo }): string {
  return bundle
    .replace(/__RAX_APP_SERVER_HTML_TEMPLATE__/, html)
    .replace(new RegExp('__CHUNK_INFO__'), encodeURIComponent(JSON.stringify(chunkInfo)));
}
