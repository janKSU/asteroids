const path = require('path');

module.exports = {
    entry: './src/asteroids.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.wav$/,
                loader: 'file-loader'
            }
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, "./dist"),
        watchContentBase: true
    },
    devtool: 'cheap-module-eval-source-map'
};