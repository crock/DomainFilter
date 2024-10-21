
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };

export default [
  // browser-friendly UMD build
  {
    input: "src/DomainFilter.ts",
    output: {
      name: "DomainFilter",
      file: pkg.browser,
      format: "umd",
      exports: "named",
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
    external: ["punycode"],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: "src/DomainFilter.ts",
    output: [
      { file: pkg.main, format: "cjs", exports: "named", sourcemap: true },
      { file: pkg.module, format: "es", exports: "named", sourcemap: true },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    external: ["punycode"],
  },
];