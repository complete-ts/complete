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
  mode: "production",
  target: "node",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            compilerOptions: {
              sourceMap: true,
            },
          },
        },
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
        configFile: path.join(
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
