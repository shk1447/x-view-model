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

// src/core/types/partial.ts
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type GetDotKeysImpl<T> = T extends object
  ? {
      [K in Exclude<keyof T, symbol>]: K extends string
        ? `${K}` | `${K}${DotPrefix<GetDotKeysImpl<T[K]>>}`
        : never;
    }[Exclude<keyof T, symbol>]
  : "";

// Path와 GetDotKeys를 통합한 새로운 타입
export type TypedPath<T> = GetDotKeysImpl<T>;

// 점으로 구분된 경로를 기반으로 타입을 추출
type PathValue<T, P extends TypedPath<T>> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? R extends TypedPath<T[K]>
      ? PathValue<T[K], R>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

// 주어진 경로들에 대한 부분 상태 타입 생성
export type PickByPath<T, P extends TypedPath<T>> = {
  [K in P as K extends `${infer A}.${string}`
    ? A extends keyof T
      ? A
      : never
    : K extends keyof T
    ? K
    : never]: K extends `${infer A}.${infer B}`
    ? A extends keyof T
      ? {
          [SubKey in B as SubKey extends `${infer X}.${string}`
            ? X
            : SubKey]: PathValue<T, K>;
        }
      : never
    : K extends keyof T
    ? T[K]
    : never;
};

export const useSelectedViewModel = <T, R, S>(
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
export const useMemoizedViewModel = <T, R, K extends TypedPath<T>[]>(
  vm: ViewModel<T, R>,
  keys?: K
): [
  K extends undefined ? T : PickByPath<T, K[number]>,
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
    const partialState = {} as PickByPath<T, K[number]>;

    keys.forEach((key) => {
      const value = get(fullState, key as string);
      set(partialState, key as string, value);
    });

    return partialState;
  }, [fullState, keys]);

  return [memoizedState, send, ref] as [
    K extends undefined ? T : PickByPath<T, K[number]>,
    typeof vm.context.send,
    R
  ];
};
