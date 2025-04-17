import { useMemo, useRef, useEffect } from "react";
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
  ) => Promise<GetFunctionReturn<T>[K]>,
  (current: PrefixCode<GetDotKeys<F>>) => Promise<boolean>,
  R
] => {
  const [state, send] = useViewModel(vf, keys);

  return [state, send, vf.flow.send, vf.ref];
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
  ) => Promise<GetFunctionReturn<T>[K]>,
  R
] => {
  const state = useInterfaceHandle(keys, vm.context);

  const send = async <K extends GetFunctionKeys<T>>(
    name: K,
    payload: GetFunctionParams<T>[K],
    options?: {
      sync: boolean;
      callback: (ret: GetFunctionReturn<T>[K]) => void;
    }
  ): Promise<any> => {
    if (options && options.sync) {
      try {
        const res = await (vm.context.property[name] as any).apply(
          vm.context.state,
          [payload]
        );
        if (options.callback) {
          options.callback(res);
        }
        return res;
      } catch (error) {
        throw error;
      }
    } else {
      vm.context.services.emit(name, [payload]);
      return false;
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

// 경로에 따른 값의 타입을 추출하는 헬퍼
type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends keyof T[Key]
      ? T[Key][Rest]
      : never
    : never
  : P extends keyof T
  ? T[P]
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
    options?: {
      sync: boolean;
      callback?: (ret: GetFunctionReturn<T>[K]) => void;
    }
  ) => Promise<GetFunctionReturn<T>[K]>,
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
    options?: {
      sync: boolean;
      callback?: (ret: GetFunctionReturn<T>[K]) => void;
    }
  ) => Promise<GetFunctionReturn<T>[K]>,
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
