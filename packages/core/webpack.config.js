const path = require('path')
const LodashWebpackPlugin = require('lodash-webpack-plugin')
const rxPaths = require('rxjs/_esm5/path-mapping')

const localPath = (...paths) => path.resolve(__dirname, ...paths)
const srcPath = (...paths) => localPath('src', ...paths)

module.exports = {
  entry: srcPath('index.js'),
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: localPath('dist'),
    filename: 'index.js',
    library: 'ObsReact',
    libraryTarget: 'umd'
  },
  stats: {
    children: false,
    modules: false,
    entrypoints: false,
    builtAt: false,
    version: false,
    hash: false
  },
  resolve: {
    alias: rxPaths()
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    'rxjs': {
      commonjs2: 'rxjs',
      commonjs: 'rxjs',
      amd: 'rxjs',
      root: 'rxjs'
    },
    'rxjs/operators': {
      commonjs2: 'rxjs/operators',
      commonjs: 'rxjs/operators',
      amd: 'rxjs/operators',
      root: ['rxjs', 'operators']
    }
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
    new LodashWebpackPlugin()
  ]
}
