import { join } from 'path';
import { SourceMapDevToolPlugin } from 'webpack';

import ESLintPlugin from 'eslint-webpack-plugin';

const getPlugins = enableSourceMaps => {
	const plugins = [
		new ESLintPlugin({ fix: true, extensions: ['js', 'jsx', 'ts', 'tsx'] })
	];

	if (enableSourceMaps) {
		plugins.push(new SourceMapDevToolPlugin({ filename: '[file].map' }));
	}

	return plugins;
};

export default ({ ENABLE_SOURCEMAPS = 'true' }) => ({
	entry: {
		index: './src/ts/index.ts'
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
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	devtool: false,
	plugins: getPlugins(ENABLE_SOURCEMAPS === 'true')
});
