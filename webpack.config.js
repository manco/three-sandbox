const path = require('path');
const webpack = require('webpack');
//TODO jest juz 0.99.0 three
module.exports = {
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './static/dist'),
        publicPath: '/dist/'
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins:[
        new webpack.ProvidePlugin({
            'THREE': 'three'
        }),
    ],
    devServer: {
        port: 9090,
        contentBase: path.resolve(__dirname, './static')
    }//,
    //devtool: 'inline-source-map'
};