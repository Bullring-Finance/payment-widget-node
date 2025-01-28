import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import terser from "@rollup/plugin-terser";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.unpkg,
        format: "umd",
        name: "BullringPaymentWidget",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        include: /node_modules/,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        outDir: "./dist",
        declaration: true,
        declarationDir: "./dist",
        inlineSources: true,
      }),
      postcss({
        config: {
          path: "./postcss.config.mjs",
        },
        extract: true,
        minimize: true,
      }),
      terser(),
    ],
  },
  {
    input: "src/styles/styles.css",
    output: [{ file: pkg.style, format: "es" }],
    plugins: [
      postcss({
        config: {
          path: "./postcss.config.mjs",
        },
        extract: true,
        minimize: true,
      }),
      terser(),
    ],
  },
];
