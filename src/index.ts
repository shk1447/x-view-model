import { NameSpacesHandler } from "./core/handler/NameSpacesHandler";
import {
  PropertyHandler,
  PropertyHandlerOptions,
} from "./core/handler/PropertyHandler";
import useInterfaceHandle from "./core/hooks/useInterfaceHandle";
import { GetDotKeys, GetFunctionKeys, GetFunctionParams, GetFunctionReturn } from "./core/types";

export type DataModel<T> = T extends (
  ...args: never[]
) => Promise<infer Response>
  ? Response
  : never;

export type ViewModel<T> = {
  watcher: (keys: GetDotKeys<T> | GetDotKeys<T>[]) => [T, T];
  handler: PropertyHandler<T>;
};

export const registViewModel = <T>(
  data: T,
  options?: PropertyHandlerOptions
): ViewModel<T> => {
  const handler = new PropertyHandler<T>(data, options);

  const vm = {
    watcher: (keys: GetDotKeys<T> | GetDotKeys<T>[]): [T, T] =>
      useInterfaceHandle<T>(keys, handler) as [T, T],
    handler,
  };

  return vm;
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
  ) => void,
  T
] => {
  const [state, data] = vm.watcher(keys ? keys : []);

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
        const res = await (vm.handler.property[name] as any).apply(vm.handler.state, [
          payload,
        ]);
        if(options.callback) {
          options.callback(res)
        }
        return true;
      } catch (error) {
        return false;
      }
    } else {
      vm.handler.services.emit(name, [payload]);
      return false
    }
  };

  return [state, send, data];
};
