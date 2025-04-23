import { PropertyHandler, PropertyHandlerOptions } from "./core/handler/PropertyHandler";
import { GetDotKeys, GetFunctionKeys, GetFunctionParams, GetFunctionReturn } from "./core/types";
export * from "./core/handler/PropertyHandler";
export type DataModel<T> = T extends (...args: never[]) => Promise<infer Response> ? Response : never;
export type ViewModel<T, R> = {
    context: PropertyHandler<T>;
    ref?: R;
};
export declare const registViewModel: <T, R = unknown>(data: T, options?: PropertyHandlerOptions<T> | undefined, ref?: R | undefined) => ViewModel<T, R>;
export declare const useViewModel: <T, R>(vm: ViewModel<T, R>, keys?: GetDotKeys<T>[] | undefined) => [T, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], async?: boolean) => Promise<GetFunctionReturn<T>[K] extends Promise<infer U> ? U : GetFunctionReturn<T>[K]>, R | undefined];
type GetDotKeysImpl<T> = T extends object ? {
    [K in keyof T & (string | number)]: T[K] extends object ? K | `${K}.${GetDotKeysImpl<T[K]>}` : K;
}[keyof T & (string | number)] : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type FastPickByPath<T, K extends GetDotKeysImpl<T>> = UnionToIntersection<{
    [P in K & string]: P extends keyof T ? {
        [Key in P]: T[Key];
    } : P extends `${infer A}.${infer B}` ? A extends keyof T ? B extends keyof T[A] ? {
        [Key in A]: {
            [SubKey in B]: T[A][SubKey];
        };
    } : never : never : never;
}[K & string]>;
export declare const useComputedViewModel: <T, R, S>(vm: ViewModel<T, R>, selector: (state: T) => S, keys?: GetDotKeys<T>[] | undefined) => [S, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], async?: boolean) => Promise<GetFunctionReturn<T>[K] extends Promise<infer U> ? U : GetFunctionReturn<T>[K]>, R | undefined];
export declare const useMemoizedViewModel: <T, R, K extends GetDotKeysImpl<T>>(vm: ViewModel<T, R>, keys?: K[] | undefined) => [UnionToIntersection<{ [P in K & string]: P extends keyof T ? { [Key in P]: T[Key]; } : P extends `${infer A}.${infer B}` ? A extends keyof T ? B extends keyof T[A] ? { [Key_1 in A]: { [SubKey in B]: T[A][SubKey]; }; } : never : never : never; }[K & string]>, <K_1 extends GetFunctionKeys<T>>(name: K_1, payload: GetFunctionParams<T>[K_1], async?: boolean) => Promise<GetFunctionReturn<T>[K_1] extends Promise<infer U> ? U : GetFunctionReturn<T>[K_1]>, R | undefined];
