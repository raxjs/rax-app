export interface IHtmlInfo {
  title?: string;
  doctype?: string;

  links?: string[];
  scripts?: string[];
  metas?: string[];
}

export interface IBuiltInDocumentQuery {
  staticExportPagePath: string;
  builtInDocumentTpl: string;
}

export interface ICustomDocumentQuery {
  documentPath: string;
  staticExportPagePath: string;
  htmlInfo: IHtmlInfo;
  pagePath: string;
}
