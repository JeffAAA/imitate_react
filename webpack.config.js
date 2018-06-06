const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');



const SRC = path.resolve('src');
const DIST = path.resolve(__dirname, 'dist');

const htmlPlugin = new HtmlWebpackPlugin({
	title: 'output Html'
})
const cleanPlugin = new CleanWebpackPlugin([DIST]);
const HMR = [new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()]

module.exports = {
	mode: 'development',
	entry: {
		app: path.resolve(SRC, 'index.js'),
	},
	plugins: [
		htmlPlugin,
		cleanPlugin,
		...HMR
	],
	module: {
		rules: [
			{
				test: /.css$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					}
				]
			},
			{
				include: path.resolve("node_modules", "lodash"),
				sideEffects: false
			}
		]
	},
	output: {
		filename: '[name].bundle.js',
		path: DIST
	},
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
};
