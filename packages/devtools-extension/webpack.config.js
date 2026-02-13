const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    'panel-react': './panel-react.js',
    'rpm-core': './rpm-core-entry.js'
  },
  output: {
    path: path.resolve(__dirname),
    filename: '[name].bundle.js'
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