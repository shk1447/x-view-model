import { FlowHanlder } from "./core/handler/FlowHandler";
import {
  PropertyHandler,
  PropertyHandlerOptions,
} from "./core/handler/PropertyHandler";
import useInterfaceHandle from "./core/hooks/useInterfaceHandle";
import {
  GetDotKeys,
  GetFunctionKeys,
  GetFunctionParams,
  GetFunctionReturn,
} from "./core/types";

export type DataModel<T> = T extends (
  ...args: never[]
) => Promise<infer Response>
  ? Response
  : never;

export type ViewModel<T, R> = {
  context: PropertyHandler<T>;
  ref: R;
};

export type ViewFlow<T, F, R> = ViewModel<T, R> & {
  flow: FlowHanlder<F, T>;
};

export type PrefixCode<T> = T extends string ? `#${T}` : never;

export type FlowDecision<T, F> = {
  invoke: (
    context: PropertyHandler<T>["state"],
    prev?: PrefixCode<GetDotKeys<F>>,
    err?: any
  ) => void;
  onDone?:
    | PrefixCode<GetDotKeys<F>>
    | ((
        context: PropertyHandler<T>["state"],
        prev?: PrefixCode<GetDotKeys<F>>,
        err?: any
      ) =>
        | Promise<PrefixCode<GetDotKeys<F>>>
        | PrefixCode<GetDotKeys<F>>
        | undefined);
  onError?:
    | PrefixCode<GetDotKeys<F>>
    | ((
        context: PropertyHandler<T>["state"],
        prev?: PrefixCode<GetDotKeys<F>>,
        err?: any
      ) =>
        | Promise<PrefixCode<GetDotKeys<F>>>
        | PrefixCode<GetDotKeys<F>>
        | undefined);
};

export const registViewFlow = <T, F, R = unknown>(
  data: T,
  flow: Record<GetDotKeys<F>, FlowDecision<T, F>>,
  options?: PropertyHandlerOptions,
  ref?: R
): ViewFlow<T, F, R> => {
  const handler = new PropertyHandler<T>(data, options);
  const fHandler = new FlowHanlder<F, T>(flow, handler);

  const vm = {
    context: handler,
    flow: fHandler,
    ref: ref,
  };

  return vm;
};

export const registViewModel = <T, R = unknown>(
  data: T,
  options?: PropertyHandlerOptions,
  ref?: R
): ViewModel<T, R> => {
  const handler = new PropertyHandler<T>(data, options);

  const vm = {
    context: handler,
    ref: ref,
  };

  return vm;
};

export const useViewFlow = <T, F, R>(
  vf: ViewFlow<T, F, R>,
  keys?: GetDotKeys<T>[]
): [
  T,
  <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    options?: {
      sync: boolean;
      callback?: (ret: GetFunctionReturn<T>[K]) => void;
    }
  ) => void,
  (current: PrefixCode<GetDotKeys<F>>) => Promise<boolean>
] => {
  const [state, send] = useViewModel(vf, keys);

  return [state, send, vf.flow.send];
};

export const useViewModel = <T, R>(
  vm: ViewModel<T, R>,
  keys?: GetDotKeys<T>[]
): [
  T,
  <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    options?: {
      sync: boolean;
      callback?: (ret: GetFunctionReturn<T>[K]) => void;
    }
  ) => void
] => {
  const state = useInterfaceHandle(keys, vm.context);

  const send = async <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    options?: {
      sync: boolean;
      callback: (ret: GetFunctionReturn<T>[K]) => void;
    }
  ) => {
    if (options && options.sync) {
      try {
        const res = await (vm.context.property[name] as any).apply(
          vm.context.state,
          [payload]
        );
        if (options.callback) {
          options.callback(res);
        }
        return true;
      } catch (error) {
        return false;
      }
    } else {
      vm.context.services.emit(name, [payload]);
      return false;
    }
  };

  return [state, send];
};
