import { join } from 'path';
import { SourceMapDevToolPlugin } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import StylelintPlugin from 'stylelint-webpack-plugin';

import ESLintPlugin from 'eslint-webpack-plugin';

const getPlugins = enableSourceMaps => {
	const plugins = [
		new MiniCssExtractPlugin({ filename: '[name].css' }),
		new ESLintPlugin({ fix: true, extensions: ['js', 'jsx', 'ts', 'tsx'] }),
		new StylelintPlugin({ fix: true, files: '**/*.scss' }),
	];

	if (enableSourceMaps) {
		plugins.push(new SourceMapDevToolPlugin({ filename: '[file].map' }));
	}

	return plugins;
};

export default ({ ENABLE_SOURCEMAPS = 'true' }) => ({
	entry: {
		'js/index': './src/ts/index.ts',
		'css/index': './src/scss/index.scss'
	},
	output: {
		libraryTarget: 'window',
		filename: '[name].js',
		path: join(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: { loader: 'babel-loader' }
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					{
						loader: MiniCssExtractPlugin.loader,
						options: { esModule: false }
					},
					'css-loader?url=false',
					'sass-loader'
				]
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	devtool: false,
	plugins: getPlugins(ENABLE_SOURCEMAPS === 'true')
});
