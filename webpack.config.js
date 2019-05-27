const path = require('path');

function resolve (dir) {
    return path.join(__dirname, dir)
}
module.exports = {
    mode: 'production',
    devtool:'eval-source-map',
    //入口文件
    entry: ['./src/index.js'],
    //出口
    output: {
        //文件名
        filename: 'lv.js',
        //路径
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'core': path.resolve(__dirname, 'src/core'),
            'shapes': path.resolve(__dirname, 'src/shapes'),
            'sprites': path.resolve(__dirname, 'src/sprites'),
            'components': path.resolve(__dirname, 'src/components'),
            '@': path.resolve(__dirname, 'src')
        }
    },
    module: {
        rules: [
            {
                test:/\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                },
                include: path.resolve(__dirname,'src')
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            quality: 1,
                            speed:4
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        contentBase: './',
        host: 'localhost',
        port: 9090, //默认9090
        inline: true, //可以监控js变化
        hot: true//热启动
    }
};

