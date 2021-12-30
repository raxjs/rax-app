import { ILoaderQuery, IFormattedLoaderQuery } from '../types';

export default function formatEntryLoaderQuery(query: ILoaderQuery): IFormattedLoaderQuery {
  return {
    ...query,
    needInjectStyle: query.needInjectStyle === 'true',
    updateDataInClient: query.updateDataInClient === 'true',
    pageConfig: JSON.parse(query.pageConfig as string || '{}'),
    injectedHTML: JSON.parse(query.injectedHTML || '{}'),
    exportPageComponent: query.exportPageComponent === 'true',
  };
}
