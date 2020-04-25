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
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Create multiple instances
const cssOutputFile = `themes/${common.workspace}-${common.theme}.css`;
const extractThemeCSS = new MiniCssExtractPlugin({
  filename: cssOutputFile,
  chunkFilename: cssOutputFile, // '[name].[contenthash].css',
  ignoreOrder: false // Enable to remove warnings about conflicting order
});

const plugins = [
  ...common.plugins,
  new webpack.optimize.OccurrenceOrderPlugin(),
  extractThemeCSS,
  new HtmlWebpackPlugin({
    template: path.join(common.appDir, 'index.html'),
    inject: 'body',
    favicon: path.join(common.mediaDir, 'images', 'favicon.ico')
  }),
  new webpack.ContextReplacementPlugin(
    /highlight\.js\/lib\/languages$/,
    new RegExp(`^./(${['plaintext', 'cpp', 'json', 'ini'].join('|')})$`)
  )
];

if (process.env.ANALYZE) {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
  mode: 'production',
  optimization: {
    concatenateModules: true,
    minimize: true,
    moduleIds: 'hashed',
    nodeEnv: 'production',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].*\.js?$/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  entry: [
    path.join(common.appDir, 'index.jsx'),
    path.join(common.mediaDir, 'styles/index.less')
  ],
  output: {
    publicPath: './',
    path: common.outputDir,
    filename: '[name].[contenthash].min.js'
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
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
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
          path.join(common.mediaDir, 'styles')
        ]
      }
    ]
  },
  plugins
};
