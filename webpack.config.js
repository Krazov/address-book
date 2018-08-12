const path                 = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = [
    // {
    //     entry: { app: './app/main.js' },
    //
    //     output: {
    //         filename: 'app.js',
    //         path:     path.resolve(__dirname, 'bundled'),
    //     }
    // },
    {
        entry: { style: './app/main.less' },

        output: {
            path: path.resolve(__dirname, 'css'),
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css',
            })
        ],

        module: {
            rules: [
                {
                    test: /\.less$/,
                    use:  [ MiniCssExtractPlugin.loader, 'css-loader', 'less-loader' ]
                }
            ]
        }
    },
];
