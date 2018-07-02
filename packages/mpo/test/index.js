const mpo = require('./index');
const path = require('path');
mpo({
  entry: {
    app: path.join(__dirname,'../../work/alipaypage/src/app.js'),
  },
  output: {
    path: './dist',
    filename: '[name].js',
  },
  //别名或其他路径
  alias: {
    'react': 'rax'
  },
  //忽略替代
  externals: {
    jquery: 'jQuery'
  },
  //扩展名称
  extensions: ['.js', '.jsx'],

  platform: ['web','wx'],
  isServer: true,
  resolveLoaderModule: [path.join(__dirname, "../node_modules"), path.join(cwdPath, "node_modules")],
  loaders: [
    {
      test: /\.js(x)?/g,
      use: 'babel-loader',
    },
    {
      test: /\.css?/g,
      use: 'css-loader',
    }
  ],
  plugins: [],

  webPConfig: {

  },
  wxPConfig: {

  }
});
