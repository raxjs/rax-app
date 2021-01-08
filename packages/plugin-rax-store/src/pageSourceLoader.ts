import { getOptions } from 'loader-utils';
import modifyRoutes from './utils/modifyRoutes';

/**
 * Amend page source in app.json routes field
 * return {
 *  "routes": [
      {
        "path": "/",
        "source": ".rax/pages/Home/Home",
      }
    ]
  }
 */
export default function pageSourceLoader(appJSON) {
  const { targetPath } = getOptions(this);
  const content = JSON.parse(appJSON);

  content.routes = modifyRoutes(content.routes, targetPath, 'Page');

  return JSON.stringify(content);
}
