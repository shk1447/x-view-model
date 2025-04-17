import { useMemo } from "react";
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
import { get, set } from "./core/utils/objectPath";

export * from "./core/handler/PropertyHandler";

export type DataModel<T> = T extends (
  ...args: never[]
) => Promise<infer Response>
  ? Response
  : never;

export type ViewModel<T, R> = {
  context: PropertyHandler<T>;
  ref: R;
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

export const useViewModel = <T, R>(
  vm: ViewModel<T, R>,
  keys?: GetDotKeys<T>[]
): [
  T,
  <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    async?: boolean
  ) => Promise<
    GetFunctionReturn<T>[K] extends Promise<infer U>
      ? U
      : GetFunctionReturn<T>[K]
  >,
  R
] => {
  const state = useInterfaceHandle(keys, vm.context);

  const send = async <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    async: boolean = false
  ): Promise<
    GetFunctionReturn<T>[K] extends Promise<infer U>
      ? U
      : GetFunctionReturn<T>[K]
  > => {
    if (async) {
      try {
        const res = await (vm.context.property[name] as any).apply(
          vm.context.state,
          [payload]
        );
        return res;
      } catch (error) {
        throw error;
      }
    } else {
      vm.context.services.emit(name, [payload]);
      return undefined as any;
    }
  };

  return [state, send, vm.ref];
};

// GetDotKeysImpl 타입 (기존 것 유지)
type GetDotKeysImpl<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends object
        ? K | `${K}.${GetDotKeysImpl<T[K]>}`
        : K;
    }[keyof T & (string | number)]
  : never;

// Union을 Intersection으로 변환 (유지)
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// 최적화된 인라인 캐시 Pick 타입
type FastPickByPath<T, K extends GetDotKeysImpl<T>> = UnionToIntersection<
  {
    [P in K & string]: P extends keyof T
      ? { [Key in P]: T[Key] }
      : P extends `${infer A}.${infer B}`
      ? A extends keyof T
        ? B extends keyof T[A]
          ? { [Key in A]: { [SubKey in B]: T[A][SubKey] } }
          : never
        : never
      : never;
  }[K & string]
>;
export const useComputedViewModel = <T, R, S>(
  vm: ViewModel<T, R>,
  selector: (state: T) => S,
  keys?: GetDotKeys<T>[]
): [
  S,
  <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    async?: boolean
  ) => Promise<
    GetFunctionReturn<T>[K] extends Promise<infer U>
      ? U
      : GetFunctionReturn<T>[K]
  >,
  R
] => {
  const [state, send, controller] = useViewModel(vm, keys);
  const selectedState = useMemo(() => selector(state), [state, selector]);

  return [selectedState, send, controller];
};

// src/core/hooks/useMemoizedViewModel.ts
export const useMemoizedViewModel = <T, R, K extends GetDotKeysImpl<T>>(
  vm: ViewModel<T, R>,
  keys?: K[]
): [
  K[] extends undefined | [] ? T : FastPickByPath<T, K>,
  <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    async?: boolean
  ) => Promise<
    GetFunctionReturn<T>[K] extends Promise<infer U>
      ? U
      : GetFunctionReturn<T>[K]
  >,
  R
] => {
  const [fullState, send, ref] = useViewModel(vm, keys as any);

  // keys가 없으면 전체 상태를 반환
  if (!keys || keys.length === 0) {
    return [fullState, send, ref] as any;
  }

  // keys에 해당하는 상태만 추출하여 메모이제이션
  const memoizedState = useMemo(() => {
    const partialState = {} as FastPickByPath<T, K>;

    keys.forEach((key) => {
      const value = get(fullState, key as string);
      set(partialState, key as string, value);
    });

    return partialState;
  }, [fullState, keys]);

  return [memoizedState, send, ref];
};
