// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Here we generate the /dist files that allow widget embedding

var path = require('path');

var version = require('./package.json').version;

var rules = [
    { test: /\.css$/, use: [
        'style-loader',
        'css-loader'
    ]},
    // jquery-ui loads some images
    { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
    // required to load font-awesome
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: {
        loader: 'url-loader',
        options: {
            limit: 10000,
            mimetype: 'application/font-woff'
        }
    }},
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: {
        loader: 'url-loader',
        options: {
            limit: 10000,
            mimetype: 'application/font-woff'
        }
    }},
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: {
        loader: 'url-loader',
        options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
        }
    }},
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: {
        loader: 'url-loader',
        options: {
            limit: 10000,
            mimetype: 'image/svg+xml'
        }
    }}
];

var publicPath = 'https://unpkg.com/@jupyter-widgets/html-manager@' + version + '/dist/';

module.exports = [
{// @jupyter-widgets/base
    entry: './node_modules/@jupyter-widgets/base/lib/index.js',
    output: {
        // library: '@jupyter-widgets/base',
        filename : 'base.js',
        path: path.resolve(__dirname, 'dist', 'amd'),
        // publicPath: publicPath,
        libraryTarget: 'amd',
    },
    module: { rules: rules },
    mode: 'production'
},
{// @jupyter-widgets/controls
    entry: './node_modules/@jupyter-widgets/controls/lib/index.js',
    output: {
        // library: '@jupyter-widgets/controls',
        filename : 'controls.js',
        path: path.resolve(__dirname, 'dist', 'amd'),
        // publicPath: publicPath,
        libraryTarget: 'amd'
    },
    module: { rules: rules },
    externals: ['@jupyter-widgets/base'],
    mode: 'production'
}
];
