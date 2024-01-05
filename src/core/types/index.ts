export type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

export type GetDotKeys<T> = T extends Date | Array<any>
  ? ""
  : (
      T extends object
        ? {
            [K in Exclude<keyof T, symbol>]:
              | `${K}`
              | `${K}${DotPrefix<GetDotKeys<T[K]>>}`;
          }[Exclude<keyof T, symbol>]
        : ""
    ) extends infer D
  ? Extract<D, string>
  : never;

export type GetFunctionKeys<T> = {
  [K in Exclude<keyof T, symbol>]: T[K] extends Function ? `${K}` : "";
}[Exclude<keyof T, symbol>] extends infer D
  ? Extract<D, string>
  : never;

export type GetFunctionParams<T> = {
  [K in keyof T]: T[K] extends (args: any) => void ? Parameters<T[K]>[0] : any;
};

export type GetFunctionReturn<T> = {
  [K in keyof T]: T[K] extends (args: any) => any ? ReturnType<T[K]> : void;
};