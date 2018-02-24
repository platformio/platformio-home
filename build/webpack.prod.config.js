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

// Create multiple instances
const extractThemeCSS = new ExtractTextPlugin(`themes/${common.theme}.css`);

module.exports = {
  entry: [
    path.join(common.appDir, 'index.jsx'),
    path.join(common.mediaDir, 'styles/index.less')
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
    loaders: [
      ...common.loaders,
      {
        test: /\.less$/,
        use: extractThemeCSS.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'less-loader',
              options: {
                modifyVars: common.packageConfig.theme[common.theme]
              }
            }
          ]
        }),
        include: [
          path.resolve(common.rootDir, 'node_modules/antd/lib'),
          path.join(common.mediaDir, 'styles')
        ]
      }
    ]
  },
  plugins: [
    ...common.plugins,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        // drop_console: true,
        drop_debugger: true
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    extractThemeCSS,
    new HtmlWebpackPlugin({
      template: path.join(common.appDir, 'index.html'),
      inject: 'body',
      favicon: path.join(common.mediaDir, 'images', 'favicon.ico')
    })
  ]
};
