# x-view-model

binding view and view-model

## Introduction

`x-view-model` is a solution that make react hooks support MVVM without introduce any third-party libriries and aims to separates UI from business logic and provide immutable data & global state management, memory management and persistent data management and provide intuitive API.

Using `x-view-model` will bring a lot of convenience as follows:

- 💼 Provide global and local state management, without introducing reducer or redux and other state management solutions;
- 🌲 Provide global cache and persistent data storage management;
- 🎩 It can make the business code more organized, maintainable and testable, and the division of responsibilities is clearer.
- 🍰 Effectively avoid the problem of too many states that need to be managed inside the component, and simplify the useState and setState writing methods in the form of objects.
- 🍷 There is no need to care about hooks inside the class-based ViewModel, so you can focus more on business logic development.
- 👋 It can realize global data update and cross-component data transfer without `useReducer` or context
- 🌲 Different stores are divided according to the key, the view component will not respond to the state changes of the unused stores, and the performance overhead can be canceled
- 🍳 ViewModel will provide basic lifecycle functions, which is more convenient than useEffect to handle asynchronous functions
- 🍖 ViewModel will automatically trigger memory recycling according to the life cycle of react hooks, and memory management is more efficient
- 🥒 No need to use `useCallback` to deal with component re-rendering problems caused by avoiding function reference changes.
- 🍰 After calling the updater to update, the latest state value can be obtained synchronously
- 👋 It can realize fine-grained update of the attribute value of the object, and can realize immutable data

<img src="https://media.perfma.net/guitar/image/WBLaY17t9r4rqA4NeKQnX.png" />

## Comparison with hooks

`x-view-model` is mainly used to separate UI and business logic, which can solve some of the problems caused by the official react hooks.

| hooks component issues                                                                                                      | x-view-model                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Usually need to set multiple useStates, can't update property values at fine granularity                                    | Support update and deconstruct data by object form, support update property values at fine granularity |
| When the component reaches a certain complexity, the code piled up together will become more and more difficult to maintain | UI and logic are well separated, code is well organized                                                |
| The closure trap problem of React Hook                                                                                      | Since the methods are maintained in the class, there is no such problem                                |

## Install

`npm install --save x-view-model`
`yarn add x-view-model`

## Usage

```ts
import React from "react";

import { registViewModel, useViewModel } from "x-view-model";

type CountType = {
  count: number;
  multiply: number;
  nested: {
    test: string[];
    deepTest: {
      level: number;
    };
  };
  increase: (payload: { amount: number }) => void;
  decrease: (payload: { amount: number }) => void;
};

const appViewModel = registViewModel<CountType>(
  {
    count: 0,
    multiply: 0,
    nested: {
      test: [],
      deepTest: {
        level: 1,
      },
    },
    increase(payload) {
      this.count = this.count + 1 + payload.amount;
    },
    decrease() {
      this.count = this.count - 1;
    },
  },
  { deep: true }
);

function App() {
  const [state, send] = useViewModel(appViewModel, ["count", "nested.test"]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", gap: "4px" }}>
        <button onClick={() => send("increase", { amount: 1 })}>+</button>
        <span>{state.count}</span>
        <button onClick={() => send("decrease", { amount: 1 })}>-</button>
      </div>
      <button onClick={() => state.nested.test.push("1")}>Nested Test</button>
    </div>
  );
}

export default App;
```

## Furture Feature

- Add PropertyHandler Options
