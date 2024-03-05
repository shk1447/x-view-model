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

## Document

[X-VIEW-MODEL 문서] (https://shk1447.github.io/x-view-model/docs/introduction/summary)

## Furture Feature

- API 고도화
- 문서 고도화
- ViewFlow or ViewModel 테스트 기능
