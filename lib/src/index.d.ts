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
