const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

module.exports = {
  entry: {
    js: './src/entry.js',
  },
  output: {
    path: path.resolve(__dirname, '../public'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('postcss-import'),
                require('postcss-cssnext'),
                require('cssnano'),
              ],
            },
          }
        }),
      }
    ],
  },
  plugins: [
    new ExtractTextPlugin("bundle.css"),
  ]
};
