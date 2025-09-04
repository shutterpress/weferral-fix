var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
var OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
var TerserPlugin = require("terser-webpack-plugin");
var CircularDependencyPlugin = require("circular-dependency-plugin");

var config = require("./../config");

var BASE_PATH = process.env.BASE_PATH || "/";

module.exports = {
  devtool: false,
  mode: "production",
  entry: {
    app: [path.join(config.srcDir, "index.js")],
  },
  output: {
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
    path: config.distDir,
    publicPath: BASE_PATH,
  },
  resolve: {
    modules: ["node_modules", config.srcDir],
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: false, // don’t fail CI; warn instead
      allowAsyncCycles: false,
      cwd: process.cwd(),
      onDetected({ paths, compilation }) {
        compilation.warnings.push(
          new Error(`circular dependency: ${paths.join(" -> ")}`)
        );
      },
    }),
    new HtmlWebpackPlugin({
      template: config.srcHtmlLayout,
      inject: false,
    }),
    new webpack.HashedModuleIdsPlugin(),
    new ExtractCssChunks(),
    new OptimizeCssAssetsPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.BASE_PATH": JSON.stringify(BASE_PATH),
    }),
  ],
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: config.srcDir,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      // Modular Styles
      {
        test: /\.css$/,
        use: [
          ExtractCssChunks.loader,
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
            },
          },
          { loader: "postcss-loader" },
        ],
        exclude: [path.resolve(config.srcDir, "styles")],
        include: [config.srcDir],
      },
      {
        test: /\.scss$/,
        use: [
          ExtractCssChunks.loader,
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
            },
          },
          { loader: "postcss-loader" },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                includePaths: config.scssIncludes,
                quietDeps: true,
                silenceDeprecations: [
                  "legacy-js-api",
                  "import",
                  "global-builtin",
                  "color-functions",
                  "slash-div",
                ],
              },
            },
          },
        ],
        exclude: [path.resolve(config.srcDir, "styles")],
        include: [config.srcDir],
      },
      // Global Styles
      {
        test: /\.css$/,
        use: [
          ExtractCssChunks.loader,
          { loader: "css-loader" },
          { loader: "postcss-loader" },
        ],
        include: [path.resolve(config.srcDir, "styles")],
      },
      {
        test: /\.scss$/,
        use: [
          ExtractCssChunks.loader,
          { loader: "css-loader" },
          { loader: "postcss-loader" },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                includePaths: config.scssIncludes,
                quietDeps: true,
                silenceDeprecations: [
                  "legacy-js-api",
                  "import",
                  "global-builtin",
                  "color-functions",
                  "slash-div",
                ],
              },
            },
          },
        ],
        include: [path.resolve(config.srcDir, "styles")],
      },
      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        loader: "file-loader",
        options: {
          name: "fonts/[name].[ext]",
        },
      },
      // Files
      {
        test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
        loader: "file-loader",
        options: {
          name: "static/[name].[ext]",
        },
      },
    ],
  },
  // devServer removed
};
