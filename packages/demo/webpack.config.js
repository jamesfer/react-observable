const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { partial } = require('lodash')
const rxPaths = require('rxjs/_esm5/path-mapping')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const localPath = path.resolve
const srcPath = partial(localPath, 'src')

const stats = {
  children: false,
  modules: false,
  builtAt: false,
  chunks: false,
  hash: false,
  version: false
}

module.exports = {
  entry: srcPath('timesheets', 'index.js'),
  mode: 'development',
  devtool: 'source-map',
  stats,
  output: {
    path: localPath('dist'),
    filename: '[name].js'
  },
  resolve: {
    alias: rxPaths()
  },
  devServer: {
    contentBase: localPath('dist'),
    stats
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: srcPath('timesheets', 'index.html'),
      filename: 'index.html'
    }),
    new BundleAnalyzerPlugin()
  ]
}
