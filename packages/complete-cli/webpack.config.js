import TSConfigPathsWebpackPlugin from "tsconfig-paths-webpack-plugin";
import WebpackShebangPlugin from "webpack-shebang-plugin";

/** @type { import('webpack').Configuration } */
const config = {
  entry: "./src/main.ts",
  mode: "production",
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
        configFile: "../../tsconfig.monorepo.json",
      }),
    ],
  },
  plugins: [new WebpackShebangPlugin()],
};

export default config;
