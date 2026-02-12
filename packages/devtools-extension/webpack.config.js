const path = require('path')

module.exports = {
  mode: 'production',
  entry: './panel-react.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'panel-react.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  optimization: {
    minimize: true
  }
}