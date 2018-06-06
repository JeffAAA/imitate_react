const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

const SRC = path.resolve('src');
const DIST = path.resolve(__dirname, 'dist');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: DIST,
        port: 9999,
        before(app) {
            app.get('/before', function (req, res) {
                res.json({ custom: 'before' });
            });
        },
        after(app) {
            app.get('/after', function (req, res) {
                res.json({ custom: 'after' });
            });
        },
        clientLogLevel: "none",
        // color: true,
        compress: true,
        hot: true
    }
});