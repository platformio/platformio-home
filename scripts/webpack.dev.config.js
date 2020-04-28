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
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: [
    'react-hot-loader/patch',
    path.join(common.appDir, 'index.jsx'),
    path.join(common.mediaDir, 'styles/index.less')
  ],
  devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
  output: {
    publicPath: '/',
    path: common.outputDir,
    filename: 'bundle.js'
  },
  resolve: {
    alias: common.resolve.alias,
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      ...common.rules,
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development'
            }
          },
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                modifyVars: common.themeModifyVars,
                javascriptEnabled: true
              }
            }
          }
        ],
        include: [
          path.resolve(common.rootDir, 'node_modules/antd/lib'),
          common.mediaDir
        ]
      }
    ]
  },
  devServer: {
    contentBase: './dist',
    // do not print bundle build stats
    noInfo: true,
    // enable HMR
    hot: true,
    // embed the webpack-dev-server runtime into the bundle
    inline: true,
    // serve index.html in place of 404 responses to allow HTML5 history
    historyApiFallback: true,
    disableHostCheck: true,
    port: 9000,
    host: 'localhost'
  },
  plugins: [
    ...common.plugins,
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style.css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: path.join(common.appDir, 'index.html'),
      inject: 'body',
      favicon: path.join(common.mediaDir, 'images', 'favicon.ico')
    })
  ]
};
