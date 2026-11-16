const path = require('path');
const { EsbuildPlugin } = require('esbuild-loader')

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
      new EsbuildPlugin({
        target: 'es2015'
      })
    ]
  },
  resolve: {
    extensions: ['.ts'],
  },
};
