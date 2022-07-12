const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
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
    ],
  };
};
