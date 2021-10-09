import { getOptions } from 'loader-utils';
import modifyRoutes from './utils/modifyRoutes';

/**
 * Amend page source in app.json routes field
 * return {
 *  "routes": [
      {
        "path": "/",
        "source": ".rax/pages/Home/index",
      }
    ]
  }
 */
export default function pageSourceLoader(appJSON: string) {
  const { tempPath, srcPath, mpa } = getOptions(this);
  const content = JSON.parse(appJSON);

  content.routes = modifyRoutes(content.routes, tempPath, srcPath, mpa);
  return JSON.stringify(content);
}
