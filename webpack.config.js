import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin';


export default {
    entry: './src/main.js', // 入口文件
    //   entry: path.resolve(__dirname, 'src', 'main.js'), // 入口文件
    output: {
        filename: 'main.js', // 输出文件名
        path: path.resolve(__dirname, 'dist', 'src'), // 输出目录
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.exe$/,
                use: 'file-loader',
            },
            {
                test: /\.js$/, // 匹配 JavaScript 文件
                exclude: /node_modules/, // 排除 node_modules 目录
                use: {
                    loader: 'babel-loader', // 使用 babel-loader 转译
                    options: {
                        presets: ['@babel/preset-env'] // 使用 @babel/preset-env 进行转译
                    }
                },
                type: 'javascript/auto'
            },
        ]
    },
    target: "node",
    plugins: [
        new CleanWebpackPlugin({
            // dry: true,
            cleanStaleWebpackAssets: true,
            protectWebpackAssets: false,
            cleanAfterEveryBuildPatterns: ['*.txt'],
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './**/*.exe', // 输入路径
                    to: 'win-tools/[name].exe', // 输出路径，相对于输出目录
                    globOptions: {
                        dot: true,
                        gitignore: true,
                        ignore: ["**/dist/**"],
                    }
                }
            ],
        }),
        (compiler) => {
            compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                // 执行你的函数
                fs.writeFileSync(
                    path.resolve(__dirname, 'dist', 'src', 'package.json'),
                    JSON.stringify({ "type": "commonjs" }, null, 2),
                    "utf-8"
                )
            });
        },
    ],

};

