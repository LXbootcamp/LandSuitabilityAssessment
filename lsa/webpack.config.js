const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "main.bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "./",
    clean: true, // 빌드 시 output 디렉토리를 정리합니다.
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      inject: "body",
    }),
    new HtmlWebpackPlugin({
      template: "./public/login.html",
      filename: "login.html",
      inject: "body",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/style.css", to: "style.css" }],
    }),
  ],
  resolve: {
    modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
    extensions: [".js", ".json"],
  },
};
