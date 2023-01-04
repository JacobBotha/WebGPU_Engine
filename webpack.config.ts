import path from 'path';
import webpack from 'webpack';
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

const devServer: DevServerConfiguration = {
    static: {
      directory: path.join(__dirname, '/dist/'),
    },
    compress: true,
    port: 9000,
    historyApiFallback: {
      index: 'index.html'
    },
    watchFiles: ["./src/**/*"]
};

const config: webpack.Configuration = {
    mode: 'production',
        entry: {
            main: "./src/main"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        publicPath: '/dist/'
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.js', '.ts'],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: ['/node_modules/']
            },            
            { test: /\.tsx?$/, loader: "ts-loader" },        
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.wgsl/,
                type: 'asset/source'
            }
        ],
    },
    devServer
};

export default config;