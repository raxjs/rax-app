import { createElement } from 'rax';
import { Root, Style, Script } from 'rax-document';

function Document(props) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover"/>
        {/* props.title 的值是通过 app.json 分析注入的 */}
        <title>{props.title}</title>
        <Style />
      </head>
      <body>
        {/* root container */}
        <Root />
        <Script />
      </body>
    </html>
  );
}
export default Document;
