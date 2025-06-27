// We build the project with webpack to avoid run-time errors relating to dependencies not existing.
// (This is only needed during development when rapid testing is required.)

import path from "node:path";
import TSConfigPathsWebpackPlugin from "tsconfig-paths-webpack-plugin";
import WebpackShebangPlugin from "webpack-shebang-plugin";

/** @type { import('webpack').Configuration } */
const config = {
  entry: "./src/main.ts",
  output: {
    path: path.join(import.meta.dirname, "dist"),
    filename: "main.cjs",
  },
  // Building with "production" creates run-time errors related to the ArkType helper functions.
  mode: "development",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
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
  plugins: [new WebpackShebangPlugin()],
};

export default config;
