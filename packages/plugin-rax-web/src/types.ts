export interface IHtmlInfo {
  title?: string;
  doctype?: string;
  assets?: {
    scripts?: string[];
    links?: string[];
  };
  injectedHTML?: {
    links?: string[];
    scripts?: string[];
    metas?: string[];
    comboScripts?: IComboScript[];
  };
  spmA?: string;
  spmB?: string;
  initialHTML: string;
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

export interface IComboScript {
  src: string;
  script: string;
}
