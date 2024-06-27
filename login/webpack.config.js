const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "main_[contenthash].js", // 파일명에 해시 추가
    path: path.resolve(__dirname, "dist"),
    publicPath: "/", // 파일들이 참조되는 경로를 지정
    clean: true, // 빌드 시 output 디렉토리를 정리합니다.
  },
  mode: "development",
  devtool: "source-map", // 소스 맵 파일 생성
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
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      inject: "body",
      scriptLoading: "module", // 모듈 타입으로 스크립트 로드
    }),
    new HtmlWebpackPlugin({
      template: "./public/login.html",
      filename: "login.html",
      inject: "body",
      scriptLoading: "module", // 모듈 타입으로 스크립트 로드
    }),
    new MiniCssExtractPlugin({
      filename: "style_[contenthash].css", // CSS 파일명에 해시 추가
    }),
  ],
  resolve: {
    alias: {
      "ol-css": path.resolve(__dirname, "node_modules/ol/ol.css"),
    },
    modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
    extensions: [".js", ".json", ".css"],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true, // SPA 라우팅을 위한 설정
  },
};
