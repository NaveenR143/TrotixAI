const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: path.join(__dirname, "src", "index.js"),
    output: {
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "public", "index.html"),
      }),
      ...(isProduction ? [
        new WorkboxWebpackPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        })
      ] : [])
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.scss$/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
        {
          test: /\.json$/,
          type: "json",
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        },
      ],
    },
    devServer: {
      historyApiFallback: true, // ✅ This is the key!
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      port: 3000,
      open: true,
    },
  };
};
