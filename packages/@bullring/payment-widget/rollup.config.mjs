// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";
import terser from "@rollup/plugin-terser";
// import pkg from "./package.json";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

export default [
  {
    input: "src/index.tsx",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        compilerOptions: {
          declaration: true,
          emitDeclarationOnly: true,
          outDir: "dist",
          declarationDir: "dist",
        },
      }),
      terser(),
    ],
    external: ["react", "react-dom", "lucide-react", /\.css$/],
  },
  {
    input: "src/index.tsx",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.css$/],
  },
  {
    input: "src/styles.css",
    output: [{ file: "dist/styles.css", format: "es" }],
    plugins: [
      postcss({
        config: {
          path: "./postcss.config.mjs",
        },
        extract: true,
        minimize: true,
      }),
    ],
  },
];
