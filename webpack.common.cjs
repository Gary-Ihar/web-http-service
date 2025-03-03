const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  target: 'web',
  entry: ['./src/index.ts'],
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve('./dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '...'],
    fallback: {
      path: false,
      buffer: false,
      crypto: false,
    },
  },
  module: {
    rules: [{ test: /\.(ts)$/, loader: 'ts-loader' }],
  },
  plugins: [
    new ESLintPlugin({
      emitError: true,
      emitWarning: true,
      extensions: ['ts'],
      configType: 'flat',
    }),
  ],
};
