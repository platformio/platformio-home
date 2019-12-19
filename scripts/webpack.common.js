/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

const rootDir = path.resolve(__dirname, '..');
const mediaDir = path.join(rootDir, 'app', 'media');
const packageConfig = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
);
const workspace = process.env.PIOHOME_WORKSPACE || 'platformio';
const theme = process.env.PIOHOME_THEME || 'dark';
const themeModifyVars = Object.assign(
  {},
  packageConfig.themes[theme],
  (packageConfig.workspaces[workspace].themes
    ? packageConfig.workspaces[workspace].themes[theme]
    : null) || {}
);

module.exports = {
  workspace: workspace,
  theme: theme,
  themeModifyVars: themeModifyVars,
  appDir: path.join(rootDir, 'app'),
  mediaDir: mediaDir,
  rootDir: rootDir,
  outputDir: path.join(rootDir, 'dist'),
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../app/modules/core/'),
      '@device': path.resolve(__dirname, '../app/modules/device/'),
      '@inspect': path.resolve(__dirname, '../app/modules/inspect/'),
      '@library': path.resolve(__dirname, '../app/modules/library/'),
      '@project': path.resolve(__dirname, '../app/modules/project/'),
      '@platform': path.resolve(__dirname, '../app/modules/platform/'),
      '@store': path.resolve(__dirname, '../app/store/'),
      '@app': path.resolve(__dirname, '../app/')
    }
  },

  rules: [
    {
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components|public\/)/,
      loader: 'babel-loader',
      options: {
        plugins: [['import', { libraryName: 'antd', style: true }]]
      }
    },
    {
      test: /\.css$/,
      loaders: ['style-loader', 'css-loader?importLoaders=1'],
      exclude: /node_modules/
    },
    {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'file-loader'
    },
    {
      test: /\.(woff|woff2)$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'url-loader?prefix=font/&limit=5000'
    },
    {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
    },
    {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
    },
    {
      test: /\.gif/,
      exclude: /(node_modules|bower_components)/,
      loader: 'url-loader?limit=10000&mimetype=image/gif'
    },
    {
      test: /\.jpg/,
      exclude: /(node_modules|bower_components)/,
      loader: 'url-loader?limit=10000&mimetype=image/jpg'
    },
    {
      test: /\.png/,
      exclude: /(node_modules|bower_components)/,
      loader: 'url-loader?limit=10000&mimetype=image/png'
    }
  ],

  plugins: [
    new WebpackCleanupPlugin(),
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(packageConfig.version)
    }),
    new CopyWebpackPlugin([{ from: path.join(mediaDir, 'fonts'), to: 'fonts' }])
  ]
};
