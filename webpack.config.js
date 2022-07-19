const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");

module.exports = (env) => {
  console.log("ENV", env);
  return {
    entry: {
      home: [
        path.join(__dirname, "./src/index.tsx"),
        path.join(__dirname, "./src/index.scss"),
      ],
      photoView: [
        path.join(__dirname, "./public/photoView/photoViewRenderer.js"),
        path.join(__dirname, "./public/photoView/photo-view-style.scss"),
      ],
    },
    output: {
      path: path.join(__dirname, "./build"),
      filename: "[name].bundle.js",
    },
    mode: process.env.NODE_ENV || "development",
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        process: "process/browser",
      },
    },
    devServer: {
      historyApiFallback: true,
      port: 3000,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
        {
          test: /\.(css|scss|sass)$/,
          use: [
            "style-loader",
            "css-loader",
            "sass-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  config: path.resolve(__dirname, "postcss.config.js"),
                },
              },
            },
          ],
        },
        {
          test: /\.(jpg|jpeg|png|gif|mp3|svg|eot|woff|woff2|ttf)$/i,
          use: ["file-loader"],
        },
        {
          test: /\.json$/i,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "public", "index.html"),
        filename: "index.html",
        favicon: path.join(__dirname, "public", "icon.ico"),
        chunks: ["home"],
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "public/photoView", "photo-view.html"),
        filename: "photo-view.html",
        chunks: ["photoView"],
      }),
      // add the plugin to your plugins array
      new webpack.EnvironmentPlugin({
        REACT_APP_API_URL: env.REACT_APP_API_URL, // use 'development' unless process.env.NODE_ENV is defined
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "./src/assets/message.json",
            to: "./message.json",
          },
        ],
      }),
    ],
    optimization: {
      minimize: true,
      minimizer: [new JsonMinimizerPlugin()],
    },
  };
};
