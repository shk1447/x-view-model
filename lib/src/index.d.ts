import { FlowHanlder } from "./core/handler/FlowHandler";
import { PropertyHandler, PropertyHandlerOptions } from "./core/handler/PropertyHandler";
import { GetDotKeys, GetFunctionKeys, GetFunctionParams, GetFunctionReturn } from "./core/types";
export * from "./core/handler/PropertyHandler";
export type DataModel<T> = T extends (...args: never[]) => Promise<infer Response> ? Response : never;
export type ViewModel<T, R> = {
    context: PropertyHandler<T>;
    ref: R;
};
export type ViewFlow<T, F, R> = ViewModel<T, R> & {
    flow: FlowHanlder<F, T>;
};
export type PrefixCode<T> = T extends string ? `#${T}` : never;
export type FlowDecision<T, F> = {
    invoke: (context: PropertyHandler<T>["state"], prev?: PrefixCode<GetDotKeys<F>>, err?: any) => void;
    onDone?: PrefixCode<GetDotKeys<F>> | ((context: PropertyHandler<T>["state"], prev?: PrefixCode<GetDotKeys<F>>, err?: any) => Promise<PrefixCode<GetDotKeys<F>>> | PrefixCode<GetDotKeys<F>> | undefined);
    onError?: PrefixCode<GetDotKeys<F>> | ((context: PropertyHandler<T>["state"], prev?: PrefixCode<GetDotKeys<F>>, err?: any) => Promise<PrefixCode<GetDotKeys<F>>> | PrefixCode<GetDotKeys<F>> | undefined);
};
export declare const registViewFlow: <T, F, R = unknown>(data: T, flow: Record<GetDotKeys<F>, FlowDecision<T, F>>, options?: PropertyHandlerOptions, ref?: R) => ViewFlow<T, F, R>;
export declare const registViewModel: <T, R = unknown>(data: T, options?: PropertyHandlerOptions, ref?: R) => ViewModel<T, R>;
export declare const useViewFlow: <T, F, R>(vf: ViewFlow<T, F, R>, keys?: GetDotKeys<T>[]) => [T, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], options?: {
    sync: boolean;
    callback?: (ret: GetFunctionReturn<T>[K]) => void;
}) => Promise<GetFunctionReturn<T>[K]>, (current: PrefixCode<GetDotKeys<F>>) => Promise<boolean>, R];
export declare const useViewModel: <T, R>(vm: ViewModel<T, R>, keys?: GetDotKeys<T>[]) => [T, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], options?: {
    sync: boolean;
    callback?: (ret: GetFunctionReturn<T>[K]) => void;
}) => Promise<GetFunctionReturn<T>[K]>, R];
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type GetDotKeysImpl<T> = T extends object ? {
    [K in Exclude<keyof T, symbol>]: K extends string ? `${K}` | `${K}${DotPrefix<GetDotKeysImpl<T[K]>>}` : never;
}[Exclude<keyof T, symbol>] : "";
export type TypedPath<T> = GetDotKeysImpl<T>;
type PathValue<T, P extends TypedPath<T>> = P extends `${infer K}.${infer R}` ? K extends keyof T ? R extends TypedPath<T[K]> ? PathValue<T[K], R> : never : never : P extends keyof T ? T[P] : never;
export type PickByPath<T, P extends TypedPath<T>> = {
    [K in P as K extends `${infer A}.${string}` ? A extends keyof T ? A : never : K extends keyof T ? K : never]: K extends `${infer A}.${infer B}` ? A extends keyof T ? {
        [SubKey in B as SubKey extends `${infer X}.${string}` ? X : SubKey]: PathValue<T, K>;
    } : never : K extends keyof T ? T[K] : never;
};
export declare const useSelectedViewModel: <T, R, S>(vm: ViewModel<T, R>, selector: (state: T) => S, keys?: GetDotKeys<T>[]) => [S, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], options?: {
    sync: boolean;
    callback?: (ret: GetFunctionReturn<T>[K]) => void;
}) => Promise<GetFunctionReturn<T>[K]>, R];
export declare const useMemoizedViewModel: <T, R, K extends GetDotKeysImpl<T>[]>(vm: ViewModel<T, R>, keys?: K) => [K extends undefined ? T : PickByPath<T, K[number]>, <K_1 extends GetFunctionKeys<T>>(name: K_1, payload: GetFunctionParams<T>[K_1], options?: {
    sync: boolean;
    callback?: (ret: GetFunctionReturn<T>[K_1]) => void;
}) => Promise<GetFunctionReturn<T>[K_1]>, R];
