import { registViewModel } from "../index";
import { Change } from "../core/observer";

type CounterState = {
  count: number;
};

type CounterAction = {
  increment(): void;
};

type CounterContext = CounterState & CounterAction;

describe("Middleware Test", () => {
  it("should execute middleware in correct order", async () => {
    const executionOrder: string[] = [];

    // 미들웨어 정의
    const middleware1 = (changes: Change[], next: () => void) => {
      console.log(changes);
      executionOrder.push("middleware1");
      next();
    };

    const middleware2 = (changes: Change[], next: () => void) => {
      executionOrder.push("middleware2");
      next();
    };

    // ViewModel 정의
    const counterVM = registViewModel<CounterContext>(
      {
        count: 0,
        increment() {
          this.count += 1;
        },
      },
      {
        name: "counter",
        deep: true,
        middlewares: [middleware1, middleware2],
      }
    );

    // 상태 감시 시작
    counterVM.context.restart();

    // 상태 변경
    await counterVM.context.send("increment", undefined, true);

    // 미들웨어 실행 순서 확인
    expect(executionOrder).toEqual(["middleware1", "middleware2"]);
  });

  it("should handle changes array in middleware", async () => {
    let receivedChanges: Change[] = [];

    // 미들웨어 정의
    const middleware = (changes: Change[], next: () => void) => {
      receivedChanges = changes;
      next();
    };

    // ViewModel 정의
    const counterVM = registViewModel<CounterContext>(
      {
        count: 0,
        increment() {
          this.count += 1;
        },
      },
      {
        name: "counter",
        deep: true,
        middlewares: [middleware],
      }
    );

    // 상태 감시 시작
    counterVM.context.restart();

    // 상태 변경
    await counterVM.context.send("increment", undefined, true);

    // changes 배열 확인
    expect(receivedChanges.length).toBeGreaterThan(0);
    expect(receivedChanges[0].path).toContain("count");
  });

  it("should work without middleware", async () => {
    // ViewModel 정의 (미들웨어 없이)
    const counterVM = registViewModel<CounterContext>(
      {
        count: 0,
        increment() {
          this.count += 1;
        },
      },
      {
        name: "counter",
        deep: true,
      }
    );

    // 상태 감시 시작
    counterVM.context.restart();

    // 상태 변경
    await counterVM.context.send("increment", undefined, true);

    // 상태 변경이 정상적으로 이루어졌는지 확인
    expect(counterVM.context.state.count).toBe(1);
  });
});
