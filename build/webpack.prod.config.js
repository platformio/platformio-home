'use strict';

/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const webpack = require('webpack');
const path = require('path');
const common = require('./webpack.common');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: [
    path.join(common.appDir, 'index.jsx'),
    path.join(common.mediaDir, 'styles', 'index.scss')
  ],
  output: {
    publicPath: './',
    path: common.outputDir,
    filename: '[hash].min.js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    loaders: common.loaders.concat({
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded' }),
      exclude: ['node_modules']
    })
  },
  plugins: [
    ...common.plugins,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        // drop_console: true,
        drop_debugger: true
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin('[contenthash].min.css'),
    new HtmlWebpackPlugin({
      template: path.join(common.appDir, 'index.html'),
      inject: 'body',
      favicon: path.join(common.mediaDir, 'images', 'favicon.ico')
    })
  ]
};
