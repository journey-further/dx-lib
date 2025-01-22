import path, { dirname } from "path";
import JfCroHmr from "jf-cro-webpack-hmr";
import { defaultMinimizerOptions } from "html-loader";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: {
    variantA: "./__mocks__/webpackEntry.js",
  },
  output: { path: path.resolve(process.cwd(), "__dist__") },
  devtool: "eval-cheap-module-source-map",
  mode: "development",
  plugins: [
    new JfCroHmr({
      previewUrl: "https://www.devere.co.uk",
      previewModule: "variantA",
      playwrightOptions: {
        channel: "chromium",
      },
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, "dist"),
    port: 3000,
  },
  watchOptions: {
    aggregateTimeout: 1000,
    poll: 1000,
    ignored: "**/node_modules",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: (filePath) => /node_modules/.test(filePath) && !/node_modules\/(jf-lib)/.test(filePath),
        use: {
          loader: "swc-loader",
          options: {
            env: {
              include: ["transform-async-to-generator", "transform-regenerator"],
            },
          },
        },
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.s?css$/,
        use: ["css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.json$/,
        type: "json",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        options: {
          minimize: {
            ...defaultMinimizerOptions,
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            noNewlinesBeforeTagClose: true,
          },
          sources: false,
        },
      },
    ],
  },
};
