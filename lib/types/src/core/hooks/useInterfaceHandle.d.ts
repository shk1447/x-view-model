import { PropertyHandler } from "../handler/PropertyHandler";
import { GetDotKeys } from "../types";
declare const useInterfaceHandle: <R>(keys: GetDotKeys<R> | GetDotKeys<R>[], handle: PropertyHandler<R>) => R;
export default useInterfaceHandle;
