import { registViewModel } from "../index";
import { Change } from "../core/observer";

type CounterState = {
  count: number;
};

type CounterAction = {
  increment(): number;
  decrement(): number;
};

type CounterContext = CounterState & CounterAction;

describe("History Test", () => {
  it("should record history for increment and decrement operations", async () => {
    const historyRecords: any[] = [];

    // ViewModel 정의
    const counterVM = registViewModel<CounterContext>(
      {
        count: 0,
        increment() {
          this.count += 1;
          return this.count;
        },
        decrement() {
          this.count -= 1;
          return this.count;
        },
      },
      {
        name: "counter",
        deep: true,
        history: {
          handler: (history, state) => {
            historyRecords.push(history);
          },
        },
      }
    );

    // 상태 감시 시작
    counterVM.context.restart();

    // increment 두 번
    await counterVM.context.send("increment", undefined, true);
    await counterVM.context.send("increment", undefined, true);

    // decrement 두 번
    await counterVM.context.send("decrement", undefined, true);
    await counterVM.context.send("decrement", undefined, true);

    // 히스토리 기록 확인
    expect(historyRecords).toHaveLength(4);

    // 각 호출의 결과 확인
    expect(historyRecords[0]).toMatchObject({
      name: "increment",
      result: 1,
    });

    expect(historyRecords[1]).toMatchObject({
      name: "increment",
      result: 2,
    });

    expect(historyRecords[2]).toMatchObject({
      name: "decrement",
      result: 1,
    });

    expect(historyRecords[3]).toMatchObject({
      name: "decrement",
      result: 0,
    });

    // 최종 상태 확인
    expect(counterVM.context.state.count).toBe(0);
  });

  it("should respect maxSize limit", async () => {
    const historyRecords: any[] = [];

    // ViewModel 정의
    const counterVM = registViewModel<CounterContext>(
      {
        count: 0,
        increment() {
          this.count += 1;
          return this.count;
        },
        decrement() {
          this.count -= 1;
          return this.count;
        },
      },
      {
        name: "counter",
        deep: true,
        history: {
          handler: (history, state) => {
            historyRecords.push(history);
          },
          maxSize: 2,
        },
      }
    );

    // 상태 감시 시작
    counterVM.context.restart();

    // increment 두 번
    await counterVM.context.send("increment", undefined, true);
    await counterVM.context.send("increment", undefined, true);

    // decrement 두 번
    await counterVM.context.send("decrement", undefined, true);
    await counterVM.context.send("decrement", undefined, true);

    // 히스토리 크기가 maxSize를 초과하지 않아야 함
    expect(counterVM.context.getSendHistory()).toHaveLength(2);

    // 가장 최근 2개의 기록만 남아있어야 함
    expect(counterVM.context.getSendHistory().map((h) => h.result)).toEqual([
      1, 0,
    ]);
  });
});
