import { Change, Observable } from "../observer";
import {
  GetDotKeys,
  GetFunctionKeys,
  GetFunctionParams,
  GetFunctionReturn,
} from "../types";
import { DevToolsHandler } from "./DevToolsHandler";
import { EventHandler } from "./EventHandler";

import { ServiceHandler } from "./ServiceHandler";

// SendHistory 타입 정의 추가
export type SendHistory = {
  name: string;
  componentName: string;
  payload: any;
  timestamp: number;
  result?: any;
  error?: Error;
};

export type Middleware<T> = (
  changes: Change[],
  next: () => void,
  state: T
) => void | Promise<void>;

// 히스토리 핸들러 타입 정의
export type HistoryHandler<T> = (
  history: SendHistory,
  state: T
) => void | Promise<void>;

// 히스토리 옵션 타입 정의
export type HistoryOptions<T> = {
  handler?: HistoryHandler<T>;
  maxSize?: number;
};

// PropertyHandlerOptions 확장
export type PropertyHandlerOptions<T> = {
  name: string;
  // 하위 데이터 변경시 이벤트가 발생됩니다.
  deep: boolean;
  middlewares?: Middleware<T>[];
  history?: HistoryOptions<T>;
};

export class PropertyHandler<R> extends EventHandler<GetDotKeys<R>> {
  private _property: R;
  private _observable: Observable & R;
  private _reference: number;
  private _started: boolean;
  private _options?: PropertyHandlerOptions<R>;
  private middlewares: Middleware<R>[] = [];
  private _sendHistory: SendHistory[] = [];
  private _historyHandler: HistoryHandler<R>;
  private _historyMaxSize: number;
  private _componentName: string = "Unknown";

  public services: ServiceHandler<R>;

  private devTools?: DevToolsHandler;

  constructor(
    init_property: R,
    options?: PropertyHandlerOptions<R>,
    devTools?: DevToolsHandler
  ) {
    super();
    this._property = init_property;
    this._options = options;
    this._reference = 0;
    this._observable = Observable.from({ ...this._property }, { async: true });
    this._started = false;
    this.services = new ServiceHandler<R>(this);

    // 히스토리 설정 초기화
    this._historyHandler = options?.history?.handler || (() => {});
    this._historyMaxSize = options?.history?.maxSize || 100;

    this.middlewares = options?.middlewares || [];

    this.devTools = devTools;
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

  // 히스토리 추가 메소드
  private async addHistory(history: SendHistory): Promise<void> {
    // 히스토리 핸들러가 있다면 실행
    if (this._historyHandler) {
      await Promise.resolve(this._historyHandler(history, this.state));
    }

    // 히스토리 저장
    this._sendHistory.push(history);

    // maxSize 제한 처리
    if (this._sendHistory.length > this._historyMaxSize) {
      this._sendHistory = this._sendHistory.slice(-this._historyMaxSize);
    }
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
    const history: SendHistory = {
      name: name as string,
      componentName: this._componentName,
      payload,
      timestamp: Date.now(),
    };

    if (async) {
      try {
        const res = await (this.property[name] as any).apply(this.state, [
          payload,
        ]);
        history.result = res;
        await this.addHistory(history);
        return res;
      } catch (error) {
        history.error = error as Error;
        await this.addHistory(history);
        throw error;
      }
    } else {
      this.services.emit(name, [payload]);
      await this.addHistory(history);
      return undefined as any;
    }
  }

  // 히스토리 조회 메소드
  public getSendHistory(): SendHistory[] {
    return this._sendHistory;
  }

  // 히스토리 클리어 메소드
  public clearSendHistory(): void {
    this._sendHistory = [];
  }
}
