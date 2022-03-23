const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sequra-pci.js',
    library: {
      name: "[name]",
      type: "var",
      export: "default"
    },
    clean: true,
  },
});
