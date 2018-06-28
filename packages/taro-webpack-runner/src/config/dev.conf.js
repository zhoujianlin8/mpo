const webpack = require('webpack')

const { getPostcssPlugins } = require('./postcss.conf')

module.exports = function (config) {
  const styleLoader = require.resolve('style-loaders')
  const cssLoader = {
    loader: require.resolve('css-loaders'),
    options: {
      importLoaders: 1
    }
  }
  const postcssLoader = {
    loader: require.resolve('postcss-loaders'),
    options: {
      ident: 'postcss',
      plugins: () => getPostcssPlugins(config)
    }
  }
  const sassLoader = require.resolve('sass-loaders')
  const lessLoader = require.resolve('less-loaders')
  const stylusLoader = require.resolve('stylus-loaders')
  return {
    devtool: 'cheap-module-eval-source-map',
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(css|scss|sass)(\?.*)?$/,
              exclude: /node_modules/,
              use: [ styleLoader, cssLoader, postcssLoader, sassLoader ]
            },
            {
              test: /\.less(\?.*)?$/,
              exclude: /node_modules/,
              use: [ styleLoader, cssLoader, postcssLoader, lessLoader ]
            },
            {
              test: /\.styl(\?.*)?$/,
              exclude: /node_modules/,
              use: [ styleLoader, cssLoader, postcssLoader, stylusLoader ]
            },
            {
              test: /\.(css|scss|sass)(\?.*)?$/,
              include: /node_modules/,
              use: [ styleLoader, cssLoader, sassLoader ]
            },
            {
              test: /\.less(\?.*)?$/,
              include: /node_modules/,
              use: [ styleLoader, cssLoader, lessLoader ]
            },
            {
              test: /\.styl(\?.*)?$/,
              include: /node_modules/,
              use: [ styleLoader, cssLoader, stylusLoader ]
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  }
}
