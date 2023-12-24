const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV ?? 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      buffer: require.resolve('buffer/'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/scripts'),
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 4000,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: `http://${process.env.IS_DOCKER === 'true' ? 'server' : 'localhost'}:3000`,
        pathRewrite: { '^/api': '' },
      }
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.EnvironmentPlugin([
      'API_URL',
      'MINI_APP_URL'
    ])
  ]
};