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
export declare const useComputedViewModel: <T, R, S>(vm: ViewModel<T, R>, selector: (state: T) => S, keys?: GetDotKeys<T>[]) => [S, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], options?: {
    sync: boolean;
    callback?: (ret: GetFunctionReturn<T>[K]) => void;
}) => Promise<GetFunctionReturn<T>[K]>, R];
export declare const useMemoizedViewModel: <T, R, K extends GetDotKeysImpl<T>>(vm: ViewModel<T, R>, keys?: K[]) => [UnionToIntersection<{ [P in K & string]: P extends keyof T ? { [Key in P]: T[Key]; } : P extends `${infer A}.${infer B}` ? A extends keyof T ? B extends keyof T[A] ? { [Key_1 in A]: { [SubKey in B]: T[A][SubKey]; }; } : never : never : never; }[K & string]>, <K_1 extends GetFunctionKeys<T>>(name: K_1, payload: GetFunctionParams<T>[K_1], options?: {
    sync: boolean;
    callback?: (ret: GetFunctionReturn<T>[K_1]) => void;
}) => Promise<GetFunctionReturn<T>[K_1]>, R];
