const path = require('path');

module.exports = {
  entry: {
    "sequraPCI": path.resolve(__dirname, "./src/index.ts")
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
};
