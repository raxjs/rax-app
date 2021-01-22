export interface IInitialContext {
  pathname: string;
  query: any;
}

export interface IContext {
  initialData?: any;
  pageInitialProps?: any;
  initialContext?: IInitialContext;
}
