import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { PropertyHandler } from "../handler/PropertyHandler";
import { GetDotKeys } from "../types";

const useInterfaceHandle = <R>(
  keys: GetDotKeys<R> | GetDotKeys<R>[],
  handle: PropertyHandler<R>
): R => {
  const [renderCount, setRenderCount] = useState<number>(0);

  const changeState = useCallback(() => {
    setRenderCount((prev: number) => prev + 1);
  }, [keys, handle]);

  useMemo(() => {
    handle.increaseReference();

    if (Array.isArray(keys)) {
      keys.forEach((key) => {
        handle.on(key, changeState);
      });
    } else {
      handle.on(keys, changeState);
    }
  }, [handle]);

  useEffect(() => {
    return () => {
      handle.decreaseReference();
      if (Array.isArray(keys)) {
        keys.forEach((key) => {
          handle.off(key, changeState);
        });
      } else {
        handle.off(keys, changeState);
      }
    };
  }, [handle]);

  return handle.state as R;
};

export default useInterfaceHandle;
