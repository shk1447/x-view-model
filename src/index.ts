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

export type ViewModel<T> = {
  context: PropertyHandler<T>;
};

export type ViewFlow<T, F> = ViewModel<T> & {
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

export const registViewFlow = <T, F>(
  data: T,
  flow: Record<GetDotKeys<F>, FlowDecision<T, F>>,
  options?: PropertyHandlerOptions
): ViewFlow<T, F> => {
  const handler = new PropertyHandler<T>(data, options);
  const fHandler = new FlowHanlder<F, T>(flow, handler);

  const vm = {
    context: handler,
    flow: fHandler,
  };

  return vm;
};

export const registViewModel = <T>(
  data: T,
  options?: PropertyHandlerOptions
): ViewModel<T> => {
  const handler = new PropertyHandler<T>(data, options);

  const vm = {
    context: handler,
  };

  return vm;
};

export const useViewFlow = <T, F>(
  vf: ViewFlow<T, F>,
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

export const useViewModel = <T>(
  vm: ViewModel<T>,
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
