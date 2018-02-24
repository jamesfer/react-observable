/**
 * Webpack file that builds the main library.
 */

const path = require('path')

function localPath (...paths) {
  return path.resolve(__dirname, ...paths)
}

module.exports = {
  entry: localPath('src', 'observable-react.js'),
  devtool: 'source-map',
  output: {
    path: localPath('dist'),
    filename: 'observable-react.js',
    library: 'ObsReact',
    libraryTarget: 'umd'
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    rxjs: {
      commonjs: 'rxjs',
      commonjs2: 'rxjs',
      amd: 'rxjs',
      root: 'Rx'
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  }
}
