import { useState } from "react";
import { FlowHanlder } from "./core/handler/FlowHandler";
import { NameSpacesHandler } from "./core/handler/NameSpacesHandler";
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
  watcher: (keys: GetDotKeys<T> | GetDotKeys<T>[]) => T;
  handler: PropertyHandler<T>;
};

export type ViewFlow<T, F> = ViewModel<T> & {
  fHandler: FlowHanlder<F, T>;
};

export type PrefixCode<T> = T extends string ? `#${T}` : never;

export type FlowDecision<T, F> = {
  invoke: (context: PropertyHandler<T>["state"]) => void;
  onDone?:
    | PrefixCode<GetDotKeys<F>>
    | ((context: PropertyHandler<T>["state"]) => PrefixCode<GetDotKeys<F>>);
  onError?:
    | PrefixCode<GetDotKeys<F>>
    | ((context: PropertyHandler<T>["state"]) => PrefixCode<GetDotKeys<F>>);
};

export const registViewFlow = <T, F>(
  data: T,
  flow: Record<GetDotKeys<F>, FlowDecision<T, F>>,
  options?: PropertyHandlerOptions
): ViewFlow<T, F> => {
  const handler = new PropertyHandler<T>(data, options);
  const fHandler = new FlowHanlder<F, T>(flow, handler);

  const vm = {
    watcher: (keys: GetDotKeys<T> | GetDotKeys<T>[]): T =>
      useInterfaceHandle<T>(keys, handler) as T,
    handler: handler,
    fHandler: fHandler,
  };

  return vm;
};

export const registViewModel = <T>(
  data: T,
  options?: PropertyHandlerOptions
): ViewModel<T> => {
  const handler = new PropertyHandler<T>(data, options);

  const vm = {
    watcher: (keys: GetDotKeys<T> | GetDotKeys<T>[]): T =>
      useInterfaceHandle<T>(keys, handler) as T,
    handler,
  };

  return vm;
};

export const useViewFlow = <T, F>(
  vf: ViewFlow<T, F>,
  keys?: GetDotKeys<T>[]
): [
  [GetDotKeys<F>, (current: PrefixCode<GetDotKeys<F>>) => void],
  [
    T,
    <K extends GetFunctionKeys<T>>(
      name: K,
      payload: GetFunctionParams<T>[K],
      options?: {
        sync: boolean;
        callback?: (ret: GetFunctionReturn<T>[K]) => void;
      }
    ) => void
  ]
] => {
  const [state, send] = useViewModel(vf, keys);
  const [current, setCurrent] = useState<GetDotKeys<F>>();
  vf.fHandler.onChangeCurrent((val) => {
    setCurrent(val);
  });

  return [
    [current, vf.fHandler.send],
    [state, send],
  ];
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
  const state = vm.watcher(keys ? keys : []);

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
        const res = await (vm.handler.property[name] as any).apply(
          vm.handler.state,
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
      vm.handler.services.emit(name, [payload]);
      return false;
    }
  };

  return [state, send];
};
