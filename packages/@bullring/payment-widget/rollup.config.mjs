import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";
import terser from "@rollup/plugin-terser";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

export default [
  {
    input: "src/web-components/payment-widget.ts",
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
        name: "BullringPayment",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
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
    external: ["react", "react-dom"],
  },
  {
    input: "src/styles/styles.css",
    output: [{ file: "dist/styles/styles.css", format: "es" }],
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
  {
    input: "src/web-components/payment-widget.ts",
    output: [{ file: "dist/payment-widget.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
