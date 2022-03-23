const path = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader')

module.exports = {
  entry: {
    "SequraPCI": path.resolve(__dirname, "./src/index.ts")
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'ts',
        }
      },
    ],
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015'
      })
    ]
  },
  resolve: {
    extensions: ['.ts'],
  },
};
