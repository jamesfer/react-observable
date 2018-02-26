const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function localPath (...paths) {
  return path.resolve(__dirname, ...paths)
}

module.exports = {
  entry: localPath('timesheets.js'),
  devtool: 'source-map',
  output: {
    path: localPath('..', 'demos-dist'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: localPath('timesheets.html'),
      filename: 'timesheets.html'
    })
  ],
  devServer: {
    contentBase: localPath('..', 'demos-dist')
  }
}
