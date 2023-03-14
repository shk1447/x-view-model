import {
  PropertyHandler,
  PropertyHandlerOptions,
} from "./core/handler/PropertyHandler";
import useInterfaceHandle from "./core/hooks/useInterfaceHandle";
import { GetDotKeys, GetFunctionKeys, GetFunctionParams } from "./core/types";

export type ViewModel<T> = {
  watcher: (keys: GetDotKeys<T> | GetDotKeys<T>[]) => T;
  handler: PropertyHandler<T>;
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
    }
  ) => void
] => {
  const state = vm.watcher(keys ? keys : []);

  const send = async <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    options?: {
      sync: boolean;
    }
  ) => {
    if (options && options.sync) {
      try {
        await (vm.handler.property[name] as any).apply(vm.handler.state, [
          payload,
        ]);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      vm.handler.services.emit(name, [payload]);
    }
  };

  return [state, send];
};
