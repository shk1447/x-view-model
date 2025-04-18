import { Change, Observable } from "../observer";
import {
  GetDotKeys,
  GetFunctionKeys,
  GetFunctionParams,
  GetFunctionReturn,
} from "../types";
import { EventHandler } from "./EventHandler";

import { ServiceHandler } from "./ServiceHandler";

export type Middleware<T> = (
  changes: Change[],
  next: () => void,
  state: T
) => void | Promise<void>;

export type PropertyHandlerOptions = {
  name: string;
  // 하위 데이터 변경시 이벤트가 발생됩니다.
  deep: boolean;
  middlewares?: Middleware<any>[];
};

export class PropertyHandler<R> extends EventHandler<GetDotKeys<R>> {
  private _property: R;
  private _observable: Observable & R;
  private _reference: number;
  private _started: boolean;
  private _options?: PropertyHandlerOptions;
  private middlewares: Middleware<R>[] = [];

  public services: ServiceHandler<R>;

  constructor(init_property: R, options?: PropertyHandlerOptions) {
    super();
    this._property = init_property;
    this._options = options;
    this._reference = 0;
    this._observable = Observable.from({ ...this._property }, { async: true });
    this._started = false;
    this.services = new ServiceHandler<R>(this);

    this.middlewares = options?.middlewares || [];
  }

  use(middleware: Middleware<R>) {
    this.middlewares.push(middleware);
    return this;
  }

  private async executeMiddlewares(
    changes: Change[],
    next: () => void
  ): Promise<void> {
    // 미들웨어가 없는 경우 바로 next 실행
    if (this.middlewares.length === 0) {
      next();
      return;
    }

    type MiddlewareChain = () => void | Promise<void>;

    const chain = this.middlewares.reduceRight<MiddlewareChain>(
      (nextMiddleware, currentMiddleware) => {
        return () => currentMiddleware(changes, nextMiddleware, this.state);
      },
      next
    );

    await chain();
  }

  public get state() {
    return this._observable;
  }

  public get property() {
    return this._property;
  }

  public get reference() {
    return this._reference;
  }

  get name() {
    return this._options && this._options.name ? this._options.name : "unnamed";
  }

  private set reference(val: number) {
    this._reference = val;
    if (this._reference > 0) {
      this.start();
    } else {
      this.stop();
    }
  }

  private watch = async (changes: Change[]) => {
    const startTime = performance.now();

    await this.executeMiddlewares(changes, () => {
      for (const change of changes) {
        const paths = change.path.filter((d) => typeof d != "number");

        if (this._options?.deep) {
          let eventName = "";
          paths.forEach((item) => {
            eventName += item + ".";
            this.emit(
              eventName.substring(0, eventName.length - 1) as GetDotKeys<R>,
              [change.object]
            );
          });
        } else {
          const eventName = paths.join(".");
          this.emit(eventName as GetDotKeys<R>, [change.object]);
        }
      }
    });

    if (process.env.NODE_ENV === "development") {
      const duration = performance.now() - startTime;
      if (duration > 33.34) {
        console.warn(
          `[x-view-model] Slow state update detected (${duration.toFixed(
            2
          )}ms)`,
          changes
        );
      }
    }
  };

  public increaseReference() {
    this.reference++;
  }

  public decreaseReference() {
    this.reference--;
  }

  private start() {
    if (this._started) return;
    Observable.observe(this._observable, this.watch);
    console.log(this.name, "started");
    this._started = true;
    return this;
  }

  private stop() {
    if (!this._started) return;
    Observable.unobserve(this._observable);
    this._observable = Observable.from({ ...this._property });
    this._started = false;
    return this;
  }

  private pause() {
    if (!this._started) return;
    Observable.unobserve(this._observable);
    return this;
  }

  public restart() {
    Observable.unobserve(this._observable);
    this._observable = Observable.from({ ...this._property });
    Observable.observe(this._observable, this.watch);
    console.log(this.name, "started");
    this._started = true;
    return this;
  }

  public snapshot() {
    this.pause();
    const snapshotJson = JSON.stringify(this._observable);
    this.start();
    return snapshotJson;
  }

  public rebase(json: string | Partial<R>) {
    const rebaseObj = typeof json === "string" ? JSON.parse(json) : json;
    this._property = { ...this._property, ...rebaseObj };
    return this;
  }

  public restore(json: string | Partial<R>) {
    this.pause();
    const restoreObj = typeof json === "string" ? JSON.parse(json) : json;
    this._observable = Observable.from({ ...this._property, ...restoreObj });
    this.start();
    return this;
  }

  public async send<K extends GetFunctionKeys<R>>(
    name: K,
    payload: GetFunctionParams<R>[K],
    async: boolean = false
  ): Promise<
    GetFunctionReturn<R>[K] extends Promise<infer U>
      ? U
      : GetFunctionReturn<R>[K]
  > {
    if (async) {
      try {
        const res = await (this.property[name] as any).apply(this.state, [
          payload,
        ]);

        return res;
      } catch (error) {
        throw error;
      }
    } else {
      this.services.emit(name, [payload]);
      return undefined as any;
    }
  }
}
