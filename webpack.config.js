/**
 *  Created by xiaolin on 2017-02-26.
 *	Copyright 2017 air. All rights reserved.
 */

'use strict'
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let fs = require('fs');
let path = require('path');
let glob = require('glob');
let ExtractTextPlugin = require("extract-text-webpack-plugin");

const ISDEV = process.env.NODE_ENV === "development";

let extractSass = new ExtractTextPlugin({
    // filename: "css/[name].[contenthash].css",
    // disable: ISDEV,
    filename: "css/[name].css"
});

//  入口文件封装函数，针对多个文件，多个输出

function entries(globPath) {
    let files = [],
        entries = {},
        entry, dirname, basename;
    globPath.forEach(function(item) {
        [].forEach.call(glob.sync(item), function(filePath) {
            files.push(filePath);
        });
    });
    for (let i = 0, len = files.length; i < len; i++) {
        entry = files[i];
        basename = path.basename(entry, '.ts');
        entries[basename] = path.resolve(__dirname, entry);
    }
    return entries;
}

//  多页面支持
function createHtml(files) {
    let htmlList = [],
        fileKeys = Object.keys(files),
        index = fileKeys.indexOf('vendor');
    index >= 0 ? fileKeys.splice(index, 1) : '';
    fileKeys.length && fileKeys.forEach((name) => htmlList.push(new HtmlWebpackPlugin({
        title: name,
        // 生成出来的html文件名
        filename: name + '.html',
        // 每个html的模版，这里多个页面使用同一个模版
        minify: {
            collapseWhitespace: !ISDEV
        },
        template: './index.html',
        // 自动将引用插入html
        inject: true,
        // 每个html引用的js模块，也可以在这里加上vendor等公用模块
        chunks: ['manifest', 'vendor', name]
    })));
    return htmlList;
}

//  分离出常用模块

module.exports = function(apptype) {

    const OUTPATH = ISDEV ? apptype + '_dev' : apptype + '_build';
    let entryFiles = entries([
        'app/src/moudle-public/*/*.ts',
        'app/src/moudle-' + apptype + '/*.ts',
        'app/src/moudle-' + apptype + '/*/*.ts'
    ]);

    entryFiles.vendor = ['vue', 'vue-class-component'];

    return {
        entry: entryFiles,
        output: {
            path: path.resolve(__dirname, 'dist/' + OUTPATH),
            filename: 'js/[name].js'
                // filename: 'js/[name].[chunkhash].js'
        },
        resolve: {
            extensions: ['.js', '.ts', 'tsx', '.vue', '.scss'],
            alias: {
                'vue$': 'vue/dist/vue.common.js'
            }
        },
        module: {
            rules: [{
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.tsx?$/,
                    loader: 'awesome-typescript-loader'
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader',
                    include: [
                        path.resolve(__dirname, "app")
                    ]
                },
                {
                    test: /\.scss$/,
                    use: extractSass.extract({
                        use: [{
                            loader: "css-loader"
                        }, {
                            loader: "sass-loader"
                        }],
                        // use style-loader in development
                        fallback: "style-loader"
                    })
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg|ttf)$/,
                    loader: 'file-loader',
                    query: {
                        name: '[name].[ext]?[hash]'
                    }
                },
                {
                    test: /\.(png|jpg|jpeg|gif)$/,
                    loader: 'url-loader?limit=8192'
                }
            ]
        },
        // devtool: ISDEV ? 'source-map' : false,
        plugins: createHtml(entryFiles).concat([
            new CopyWebpackPlugin([{
                from: 'assets',
                to: 'assets'
            }, {
                from: 'manifest.json',
                to: 'manifest.json'
            }]),
            // split vendor js into its own file
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: function(module, count) {
                    // any required modules inside node_modules are extracted to vendor
                    return (module.resource && /\.js$/.test(module.resource) && module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0);
                }
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest' //But since there are no more common modules between them we end up with just the runtime code included in the manifest file
            }),
            new ExtractTextPlugin("styles.css"),
            extractSass
        ])
    };
}