const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { partial } = require('lodash')
const rxPaths = require('rxjs/_esm5/path-mapping')

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

module.exports = (env, argv) => {
  const production = argv.mode === 'production'
  return {
    entry: srcPath('index.js'),
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
        },
        {
          test: /\.(scss|sass)/,
          use: [
            production ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'sass-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: srcPath('index.html'),
        filename: 'index.html'
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      })
    ]
  }
}
