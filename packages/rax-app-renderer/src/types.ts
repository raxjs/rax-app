export interface IInitialContext {
  pathname: string;
  query: {
    [key: string]: string;
  };
}

export interface IContext {
  initialData?: any;
  pageInitialProps?: any;
  initialContext?: IInitialContext;
}
