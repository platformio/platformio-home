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
      use: [
        {
          loader: 'babel-loader',
          options: {
            plugins: [['import', { libraryName: 'antd', style: true }]]
          }
        }
      ]
    },
    {
      test: /\.css$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader', options: { importLoaders: true } }
      ],
      exclude: /node_modules/
    },
    {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /(node_modules|bower_components)/,
      use: [{ loader: 'file-loader' }]
    },
    {
      test: /\.(woff|woff2)$/,
      exclude: /(node_modules|bower_components)/,
      use: [{ loader: 'url-loader', options: { prefix: 'font/', limit: 5000 } }]
    },
    {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: 'url-loader',
          options: { mimetype: 'application/octet-stream', limit: 10000 }
        }
      ]
    },
    {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: 'url-loader',
          options: { mimetype: 'image/svg+xml', limit: 10000 }
        }
      ]
    },
    {
      test: /\.gif/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: 'url-loader',
          options: { mimetype: 'image/gif', limit: 10000 }
        }
      ]
    },
    {
      test: /\.jpg/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: 'url-loader',
          options: { mimetype: 'image/jpg', limit: 10000 }
        }
      ]
    },
    {
      test: /\.png/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: 'url-loader',
          options: { mimetype: 'image/image/png', limit: 10000 }
        }
      ]
    }
  ],

  plugins: [
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(packageConfig.version)
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(mediaDir, 'fonts'), to: 'fonts' }]
    })
  ]
};
