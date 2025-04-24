import { useMemo, useRef } from "react";
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

import { DevToolsHandler } from "./core/handler/DevToolsHandler";

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

export const devTools = new DevToolsHandler();

export const registViewModel = <T, R = undefined>(
  data: T,
  options?: PropertyHandlerOptions<T>,
  ref?: R
): ViewModel<T, R> => {
  const handler = new PropertyHandler<T>(data, options);

  const vm = {
    context: handler,
    ref: ref ? ref : (undefined as R),
  };

  return vm;
};

const getComponentName = () => {
  if (process.env.NODE_ENV !== "development") {
    return "Unknown";
  }
  try {
    throw new Error();
  } catch (error) {
    if (!(error instanceof Error)) {
      return "Unknown";
    }

    const stack = error.stack || "";
    const stackLines = stack.split("\n");

    // 더 복잡한 정규식으로 다양한 패턴 처리
    const componentPatterns = [
      /at ([A-Z][A-Za-z0-9_$]*) \(/, // 일반 함수 컴포넌트
      /at ([A-Z][A-Za-z0-9_$]*)\s/, // 화살표 함수 컴포넌트
      /\.(jsx|tsx|js|ts):(\d+).*\s([A-Z][A-Za-z0-9_$]*)/, // 파일명에서 추출
    ];

    for (let i = 2; i < Math.min(stackLines.length, 8); i++) {
      const line = stackLines[i];
      for (const pattern of componentPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
    }

    // 파일명에서 컴포넌트 이름 추출 시도
    const fileNameMatch = stack.match(
      /\/([A-Z][A-Za-z0-9_$]*)\.(jsx|tsx|js|ts)/
    );
    if (fileNameMatch && fileNameMatch[1]) {
      return fileNameMatch[1];
    }

    return "Anonymous";
  }
};

export const useViewModel = <T, R>(
  vm: ViewModel<T, R>,
  keys?: GetDotKeys<T>[],
  componentName?: string
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
  if (!componentName) {
    componentName = useMemo(() => {
      return getComponentName();
    }, []);
  }
  devTools.registerComponent(vm.context, componentName);

  const state = useInterfaceHandle(keys as any, vm.context);

  return [
    state,
    vm.context.send.bind(
      Object.assign(vm.context, { _componentName: componentName })
    ),
    vm.ref,
  ];
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
  const compName = useMemo(() => {
    return getComponentName();
  }, []);
  const [state, send, controller] = useViewModel(vm, keys, compName);
  const selectedState = useMemo(() => selector(state), [state, selector]);

  return [selectedState, send, controller];
};

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
  const compName = useMemo(() => {
    return getComponentName();
  }, []);
  const [fullState, send, ref] = useViewModel(vm, keys as any, compName);

  return [fullState, send, ref] as any;
};
