import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { PropertyHandler } from "../handler/PropertyHandler";
import { GetDotKeys } from "../types";

const deepPartialCopy = (obj: any, keys: string[], _key: string) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  let copy:any;
  if(Array.isArray(obj)) {
    if(_key && keys.includes(_key)) {
      copy = obj;
    }
  } else {
    copy =  {};
    for (let key in obj) {
      if(_key == "") {
        copy[key] = deepPartialCopy(obj[key], keys, key);
      } else if(keys.includes(_key)) {
        copy[key] = deepPartialCopy(obj[key], keys, _key + "." + key);
      }

    }
  }
  return copy;
}

const useInterfaceHandle = <R>(
  keys: GetDotKeys<R> | GetDotKeys<R>[],
  handle: PropertyHandler<R>
): R => {
  const [renderCount, setRenderCount] = useState<number>(0);

  const changeState = useCallback(() => {
    setRenderCount((prev: number) => prev + 1);
  }, []);

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

  
  return handle.state as R
};

export default useInterfaceHandle;
