declare module 'error-stack-tracey' {
  export function parse(error: object, bundleContent: string): any[];
  export function print(message: string, stackFrame: any[]): void;
}
