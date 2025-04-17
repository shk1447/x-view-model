import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".jsx", ".ts", ".tsx", ".scss"];

process.env.BABEL_ENV = "production";

function setUpRollup({ input, output, minify = false }) {
  return {
    input,
    exports: "named",
    output: {
      ...output,
      sourcemap: true,
    },
    watch: {
      include: "*",
      exclude: "node_modules/**",
    },
    plugins: [
      peerDepsExternal(),
      json(),
      resolve({ 
        extensions,
        preferBuiltins: true,
      }),
      commonjs({
        include: /node_modules/,
      }),
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: "lib/types",
          },
        },
      }),
      ...(minify ? [terser()] : []),
    ],
    external: ["react", "react-dom"],
  };
}

export default [
  // ESM (unminified)
  setUpRollup({
    input: "./src/index.ts",
    output: {
      file: "lib/index.esm.js",
      format: "esm",
    },
  }),
  // ESM (minified)
  setUpRollup({
    input: "./src/index.ts",
    output: {
      file: "lib/index.esm.min.js",
      format: "esm",
    },
    minify: true,
  }),
  // CJS (unminified)
  setUpRollup({
    input: "./src/index.ts",
    output: {
      file: "lib/index.js",
      format: "cjs",
    },
  }),
  // CJS (minified)
  setUpRollup({
    input: "./src/index.ts",
    output: {
      file: "lib/index.min.js",
      format: "cjs",
    },
    minify: true,
  }),
  // Type definitions
  {
    input: "src/index.ts",
    output: [{ file: "lib/index.d.ts", format: "cjs" }],
    plugins: [dts()],
  },
];
