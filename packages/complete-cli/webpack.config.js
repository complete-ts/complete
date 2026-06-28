// We build the project with webpack to avoid run-time errors relating to dependencies not existing.
// (This is only needed during development when rapid testing is required.)

import path from "node:path";
import TSConfigPathsWebpackPlugin from "tsconfig-paths-webpack-plugin";
import WebpackShebangPlugin from "webpack-shebang-plugin";

/** @type {import("webpack").Configuration} */
const config = {
  entry: "./src/main.ts",
  mode: "production",
  module: {
    rules: [
      {
        exclude: /node_modules/v,
        test: /\.ts$/v,
        use: "ts-loader",
      },
    ],
  },
  output: {
    filename: "main.cjs",
    path: path.join(import.meta.dirname, "dist"),
  },
  plugins: [new WebpackShebangPlugin()],
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
    extensions: [".js", ".ts"],
    plugins: [
      new TSConfigPathsWebpackPlugin({
        // We cannot use a relative path here or else Knip will throw an error.
        configFile: path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "tsconfig.monorepo.json",
        ),
      }),
    ],
  },
  target: "node",
};

export default config;
