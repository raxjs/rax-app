import { createElement } from 'rax';
import { Root, Style, Script, App } from 'rax-document';
import appJSON from '../app.json';

function Document(props) {
  return (
    <App config={appJSON}>
      {(pageInfo) => (
        <html>
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover"
            />
            <link rel="stylesheet" href={stylesheet} />
            <title>{ props.title }</title>
            <Style />
          </head>
          <body>
            {/* root container */}
            <Root />
            <Script />
          </body>
        </html>
      )}
    </App>
  );
}

export default Document;
