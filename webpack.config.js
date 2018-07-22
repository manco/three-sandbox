const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js'),
            'three/OBJLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/OBJLoader.js')
        }
    },
    plugins:[
        new webpack.ProvidePlugin({
            'THREE': 'three'
        }),
    ]
};
// const path = require('path');
//
// module.exports = {
//
//     entry: './src/ts/main.tsx',
//     module: {
//         rules: [
//             {
//                 test: /\.tsx?$/,
//                 use: 'ts-loader',
//                 exclude: /node_modules/
//             }
//         ]
//     },
//     resolve: {
//         extensions: [ '.tsx', '.ts', '.js' ]
//     },
//     output: {
//         filename: 'bundle.js',
//         path: path.resolve(__dirname, './static/dist'),
//         publicPath: '/dist/'
//     },
//
//     devServer: {
//         port: 9090,
//         contentBase: path.resolve(__dirname, './static')
//     },
//
//     devtool: 'inline-source-map',
// }