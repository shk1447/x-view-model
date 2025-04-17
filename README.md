# x-view-model

<div align="center">

[![npm version](https://img.shields.io/npm/v/x-view-model.svg?style=flat)](https://www.npmjs.com/package/x-view-model)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/x-view-model)](https://bundlephobia.com/package/x-view-model)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

A lightweight, type-safe MVVM state management solution for React applications

</div>

## Why x-view-model?

x-view-model is designed to provide a simple yet powerful state management solution for React applications. It combines the best practices of MVVM pattern with modern React features:

- 🚀 **High Performance**: Optimized for minimal re-renders and efficient updates
- 💪 **Type Safety**: Full TypeScript support with comprehensive type inference
- 🎯 **MVVM Pattern**: Clean separation of concerns between view and business logic
- 🔄 **Reactive**: Automatic updates when state changes
- 🎨 **Computed Properties**: Derive values from state with automatic updates
- 🔍 **Deep Path Selection**: Subscribe to nested state changes efficiently
- 📦 **Lightweight**: Minimal bundle size (~13.5KB minified, ~5KB gzipped)
- 🛠 **Developer Experience**: Intuitive API with comprehensive tooling
- 🔄 **Smart Memory Management**: Automatic disposal through reference counting

## Why Choose x-view-model Over Other Solutions?

### 🏆 Superior TypeScript Support

Unlike other state management libraries that add TypeScript support as an afterthought, x-view-model is built with TypeScript from the ground up:

```typescript
// Full type inference for state and methods
const [state, send] = useViewModel(userVM, ["name", "email"]);

// Type-safe path selection
const [state] = useMemoizedViewModel(userVM, [
  "profile.avatar",
  "settings.theme",
] as const);

// Type-safe computed values
const [state] = useComputedViewModel(
  userVM,
  (state) => ({
    fullName: `${state.firstName} ${state.lastName}`,
  }),
  ["firstName", "lastName"]
);
```

### ⚡️ Unmatched Performance

x-view-model is designed for maximum performance:

- **Zero Dependencies**: No external dependencies means faster loading and smaller bundle size
- **Smart Updates**: Only re-renders components when their subscribed state changes
- **Efficient Path Selection**: Subscribe to specific state paths to minimize re-renders
- **Optimized Computations**: Computed values are cached and only recomputed when dependencies change
- **Tree-shakeable**: Only include the code you use in your final bundle
- **Smart Resource Management**: Automatic disposal of unused view models through reference counting

### 🎯 Clean Architecture

The MVVM pattern provides a clear separation of concerns:

```typescript
// View Model (Business Logic)
const userVM = registViewModel<UserContext>({
  name: "",
  email: "",
  updateProfile(data) {
    if (data.name) this.state.name = data.name;
    if (data.email) this.state.email = data.email;
  },
});

// View (UI)
function UserProfile() {
  const [state, send] = useViewModel(userVM, ["name", "email"]);
  return (
    <div>
      <p>Name: {state.name}</p>
      <p>Email: {state.email}</p>
      <button onClick={() => send("updateProfile", { name: "John" })}>
        Update
      </button>
    </div>
  );
}
```

### 🔄 Seamless Async Support

Handle asynchronous operations with ease:

```typescript
const [state, send] = useViewModel(userVM, ["loading", "data"]);

// Event-based call
send("fetchData");

// Async call with return value
const result = await send("fetchData", {}, true);

// Type-safe error handling
try {
  const data = await send("fetchData", {}, true);
} catch (error) {
  // Handle error
}
```

### 📊 Performance Comparison

| Feature            | x-view-model | Redux  | MobX     | Zustand  |
| ------------------ | ------------ | ------ | -------- | -------- |
| Bundle Size        | ~13.5KB      | ~7KB   | ~16KB    | ~1KB     |
| TypeScript Support | ⭐⭐⭐⭐⭐   | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Learning Curve     | ⭐⭐⭐⭐     | ⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐⭐ |
| Performance        | ⭐⭐⭐⭐⭐   | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Code Complexity    | ⭐⭐⭐⭐⭐   | ⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐⭐ |
| Async Support      | ⭐⭐⭐⭐⭐   | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Installation

```bash
npm install x-view-model

# or using yarn
yarn add x-view-model

# or using pnpm
pnpm add x-view-model
```

## Quick Start

Here's a simple counter example to get you started:

```typescript
import { registViewModel, useViewModel } from "x-view-model";

// Define your view model interface
interface CounterViewModel {
  count: number;
  increment(): void;
  decrement(): void;
}

// Create a view model
const counterVM = registViewModel<CounterViewModel>(
  {
    count: 0,
    increment() {
      this.state.count += 1;
    },
    decrement() {
      this.state.count -= 1;
    },
  },
  { name: "counter-view-model", deep: true }
);

// Use in your component
function Counter() {
  // The second parameter ["count"] specifies which state properties to subscribe to
  // This optimizes re-renders by only updating when these specific properties change
  const { state, increment, decrement } = useViewModel(counterVM, ["count"]);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

## Core Concepts

### View Models

View models encapsulate your application's business logic and state. They provide a clean separation between your UI and business logic:

```typescript
type UserState = {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: {
    avatar: string;
  };
  settings: {
    theme: "dark" | "light";
  };
};

type UserAction = {
  updateProfile(payload: { name?: string; email?: string }): void;
  fetchUserData(payload: { userId: string }): Promise<{
    id: string;
    name: string;
    email: string;
  }>;
};

export type UserContext = UserState & UserAction;

const userVM = registViewModel<UserContext>(
  {
    name: "",
    email: "",
    firstName: "",
    lastName: "",
    profile: {
      avatar: "",
    },
    settings: {
      theme: "dark",
    },
    updateProfile(data: { name?: string; email?: string }) {
      if (data.name) this.state.name = data.name;
      if (data.email) this.state.email = data.email;
    },
    async fetchUserData(data: { userId: string }) {
      // Simulate API call
      return {
        id: data.userId,
        name: "John Doe",
        email: "john@example.com",
      };
    },
  },
  { name: "user-view-model", deep: true }
);
```

### Hooks

#### useViewModel

The basic hook for accessing view model state and methods:

```typescript
const [state, send] = useViewModel(userVM, ["name", "email"]);

// Send function usage examples:
// 1. Update profile (void return)
send("updateProfile", { name: "John Doe" }); // Event-based call
await send("updateProfile", { name: "John Doe" }, true); // Async call

// 2. Fetch data (with return value)
const userData = await send("fetchUserData", { userId: "123" }, true); // Returns user data
// userData will be: { id: "123", name: "John Doe", email: "john@example.com" }

/* The send function's behavior depends on the async parameter:
 * - When async is false (default): Calls the method as an event and returns void
 * - When async is true: Calls the method and returns its result
 *   - If the method returns a Promise, it will be unwrapped
 *   - If the method returns a value directly, that value will be returned
 */
```

#### useMemoizedViewModel

Optimized hook for selecting specific paths from your view model:

```typescript
const [state, send] = useMemoizedViewModel(userVM, [
  "name",
  "profile.avatar",
  "settings.theme",
] as const);

/* useMemoizedViewModel only subscribes to and returns the specified state paths.
 * In this example, the state object will only contain:
 * - state.name
 * - state.profile.avatar
 * - state.settings.theme
 * Other properties will not be included in the state object.
 */
```

#### useComputedViewModel

Create computed values from your view model state:

```typescript
const [state, send] = useComputedViewModel(
  userVM,
  (state) => ({
    fullName: `${state.firstName} ${state.lastName}`,
  }),
  ["firstName", "lastName"]
);

/* useComputedViewModel returns only the computed values when their dependencies change.
 * In this example, when firstName or lastName changes, the state object will only contain:
 * - state.fullName
 * The computed value fullName will be automatically updated whenever firstName or lastName changes.
 */
```

## Advanced Usage

### Simple Form Example

Here's a simple form example demonstrating basic state management:

```typescript
type FormState = {
  username: string;
  email: string;
  isValid: boolean;
};

type FormAction = {
  updateField(payload: { field: keyof FormState; value: string }): void;
  validateForm(): boolean;
};

type FormContext = FormState & FormAction;

const formVM = registViewModel<FormContext>({
  username: "",
  email: "",
  isValid: false,
  updateField({ field, value }) {
    this.state[field] = value;
    this.state.isValid = this.validateForm();
  },
  validateForm() {
    return this.state.username.length > 0 && this.state.email.includes("@");
  },
});

function FormComponent() {
  const [state, send] = useViewModel(formVM, ["username", "email", "isValid"]);

  return (
    <form>
      <input
        value={state.username}
        onChange={(e) =>
          send("updateField", { field: "username", value: e.target.value })
        }
        placeholder="Username"
      />
      <input
        value={state.email}
        onChange={(e) =>
          send("updateField", { field: "email", value: e.target.value })
        }
        placeholder="Email"
      />
      <button disabled={!state.isValid}>Submit</button>
    </form>
  );
}
```

### Controller Pattern with Canvas

This example demonstrates how to use x-view-model with the controller pattern for handling complex DOM manipulations like Canvas:

```typescript
// types/canvas.ts
export interface CanvasState {
  width: number;
  height: number;
  color: string;
  lineWidth: number;
  isDrawing: boolean;
  points: Array<{ x: number; y: number }>;
}

// controllers/CanvasController.ts
export class CanvasController {
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(private state: CanvasState) {}

  setCanvas(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.lineWidth = this.state.lineWidth;
      this.ctx.strokeStyle = this.state.color;
      this.ctx.lineCap = "round";
    }
  }

  startDrawing(x: number, y: number) {
    if (!this.ctx) return;

    this.state.isDrawing = true;
    this.state.points = [{ x, y }];

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(x: number, y: number) {
    if (!this.ctx || !this.state.isDrawing) return;

    this.state.points.push({ x, y });

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.ctx) return;

    this.state.isDrawing = false;
    this.ctx.closePath();
  }

  clearCanvas() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.state.width, this.state.height);
    this.state.points = [];
  }

  setColor(color: string) {
    this.state.color = color;
    if (this.ctx) {
      this.ctx.strokeStyle = color;
    }
  }

  setLineWidth(width: number) {
    this.state.lineWidth = width;
    if (this.ctx) {
      this.ctx.lineWidth = width;
    }
  }
}

// viewModels/canvasViewModel.ts
import { registViewModel } from "x-view-model";
import { CanvasController } from "../controllers/CanvasController";
import { CanvasState } from "../types/canvas";

const initialState: CanvasState = {
  width: 800,
  height: 600,
  color: "#000000",
  lineWidth: 2,
  isDrawing: false,
  points: [],
};

const controller = new CanvasController(initialState);

export const canvasViewModel = registViewModel<CanvasState, CanvasController>(
  initialState,
  {
    name: "canvas-view-model",
    deep: true,
  },
  controller
);

// components/CanvasComponent.tsx
import React, { useRef, useEffect } from "react";
import { useViewModel } from "x-view-model";
import { canvasViewModel } from "../viewModels/canvasViewModel";

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, send, controller] = useViewModel(canvasViewModel, [
    "color",
    "lineWidth",
    "width",
    "height",
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      controller.setCanvas(canvasRef.current);
    }
  }, [controller]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    controller.startDrawing(x, y);
  };

  return (
    <div>
      <div className="controls">
        <input
          type="color"
          value={state.color}
          onChange={(e) => controller.setColor(e.target.value)}
        />
        <input
          type="range"
          min="1"
          max="20"
          value={state.lineWidth}
          onChange={(e) => controller.setLineWidth(Number(e.target.value))}
        />
        <button onClick={() => controller.clearCanvas()}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={state.width}
        height={state.height}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          controller.draw(e.clientX - rect.left, e.clientY - rect.top);
        }}
        onMouseUp={() => controller.stopDrawing()}
        onMouseLeave={() => controller.stopDrawing()}
        style={{ border: "1px solid #000" }}
      />
    </div>
  );
};
```

## Performance

x-view-model is optimized for performance:

- **Efficient Updates**: Only re-renders components when their subscribed state changes
- **Path-based Selection**: Subscribe to specific state paths to minimize re-renders
- **Memoized Computations**: Computed values are cached and only recomputed when dependencies change
- **Minimal Overhead**: Small bundle size with zero dependencies
- **Tree-shakeable**: Only include the code you use
- **Smart Resource Management**: Automatic disposal of unused view models through reference counting

## Type Safety

The library provides excellent TypeScript support:

- Full type inference for state and methods
- Path-based type selection
- Method parameter typing
- Return value typing
- Generic type support

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

ISC © [seokhwan.kim](https://github.com/shk1447)

## Support

- [Documentation](https://shk1447.github.io/x-view-model/docs/introduction/summary)
- [Issues](https://github.com/shk1447/x-view-model/issues)
- [Discussions](https://github.com/shk1447/x-view-model/discussions)

## FAQ

### General Questions

#### Q: What's the difference between View Model and regular React state management?

A: View Model provides a structured way to manage state and business logic using the MVVM pattern. Unlike regular React state, it:

- Separates business logic from UI components
- Provides type-safe state management
- Enables efficient updates through path-based subscriptions
- Supports computed properties and async operations

#### Q: Why use the MVVM pattern?

A: MVVM pattern offers several benefits:

- Clear separation of concerns between view and business logic
- Better testability of business logic
- More maintainable and scalable code structure
- Easier state management in complex applications

#### Q: Why choose x-view-model over Redux or MobX?

A: x-view-model offers:

- Simpler API with less boilerplate
- Better TypeScript support out of the box
- Smaller bundle size
- More intuitive state management
- Better performance through optimized updates

### Performance

#### Q: How does it perform in production?

A: x-view-model is optimized for production use:

- Efficient updates with minimal re-renders
- Small bundle size (~13.5KB minified)
- Zero dependencies for better performance
- Optimized for both small and large applications

#### Q: Does it work well with large applications?

A: Yes, x-view-model is designed to scale:

- Path-based state selection for efficient updates
- Computed properties for derived state
- Modular architecture for better code organization
- Type-safe state management for better maintainability

#### Q: What about memory usage?

A: Memory usage is optimized through:

- Efficient state updates
- Smart garbage collection
- Minimal overhead in state management
- No unnecessary re-renders

### TypeScript

#### Q: Can I use it without TypeScript?

A: Yes, x-view-model works with plain JavaScript, but you'll miss out on:

- Type safety
- Better IDE support
- Easier refactoring
- Better documentation through types

#### Q: How to handle complex type definitions?

A: For complex types:

- Use type aliases for better readability
- Leverage TypeScript's utility types
- Break down complex types into smaller interfaces
- Use generics for reusable components

#### Q: Any tips for using generic types?

A: When using generics:

- Define clear type constraints
- Use type inference when possible
- Document generic type parameters
- Test with different type parameters

### State Management

#### Q: How to distinguish between global and local state?

A: Best practices:

- Use global state for shared data
- Use local state for component-specific data
- Consider using multiple view models for different concerns
- Use path-based selection for efficient updates

#### Q: How to optimize frequent state updates?

A: Optimization strategies:

- Use path-based selection
- Implement debouncing for rapid updates
- Use computed properties for derived state
- Consider batching updates

#### Q: How to efficiently manage nested state?

A: For nested state:

- Use path-based selection
- Implement proper type definitions
- Use computed properties for derived values
- Consider flattening deeply nested state

### Async Operations

#### Q: What's the best way to handle async operations?

A: Recommended approaches:

- Use the `send` function with async flag
- Implement proper error handling
- Use loading states for better UX
- Consider using async/await for cleaner code

#### Q: How to handle errors?

A: Error handling best practices:

- Use try/catch blocks
- Implement proper error boundaries
- Provide meaningful error messages
- Consider using error states in your view model

#### Q: How to manage loading states?

A: Loading state management:

- Use boolean flags in your state
- Implement loading indicators
- Consider using a loading queue
- Handle loading states in your UI components

### Testing

#### Q: How to test View Models?

A: Testing strategies:

- Unit test business logic
- Mock dependencies
- Test state updates
- Verify computed properties
- Test async operations

#### Q: How to set up the testing environment?

A: Testing setup:

- Use Jest or your preferred testing framework
- Mock React dependencies
- Set up proper TypeScript configuration
- Implement test utilities

#### Q: How to handle mocking?

A: Mocking approaches:

- Mock external dependencies
- Use dependency injection
- Implement proper test fixtures
- Consider using test factories

### Migration

#### Q: How to migrate from Redux?

A: Migration steps:

1. Identify Redux store slices
2. Create corresponding view models
3. Gradually replace Redux usage
4. Update components to use view models
5. Remove Redux dependencies

#### Q: How to refactor existing code?

A: Refactoring approach:

1. Start with small, isolated components
2. Create view models for business logic
3. Update components to use view models
4. Test thoroughly after each change
5. Gradually expand the refactoring

#### Q: Is incremental migration possible?

A: Yes, x-view-model supports:

- Gradual adoption
- Coexistence with other state management
- Step-by-step migration
- Parallel usage during transition

### Community

#### Q: Where can I get help?

A: Support channels:

- GitHub Issues
- GitHub Discussions
- Documentation
- Community forums

#### Q: How can I contribute?

A: Contribution options:

- Report bugs
- Suggest features
- Improve documentation
- Submit pull requests
- Share examples

#### Q: What to do when finding a bug?

A: Bug reporting steps:

1. Check existing issues
2. Create a minimal reproduction
3. Provide detailed information
4. Submit a bug report

---

Made with ❤️ by [seokhwan.kim](https://github.com/shk1447)
