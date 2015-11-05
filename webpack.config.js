var webpack = require('webpack')
var path = require('path')

var TARGET = process.env.npm_lifecycle_event
process.env.BABEL_ENV = TARGET

var APP_PATH = path.resolve(__dirname, 'modules/index.js')
var BUILD_PATH = path.resolve(__dirname, 'lib')

module.exports = {
  entry: APP_PATH,

  output: {
    library: 'UrlMatcher',
    path: BUILD_PATH,
    filename: 'index.js'
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]

}
