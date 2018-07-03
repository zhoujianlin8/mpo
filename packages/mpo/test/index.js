const mpo = require('../index');
const path = require('path');
mpo({
  entry: {
    app: '/Users/bbt/work/alipaypage/src/app.js',
  },
  output: {
    path:  path.join(__dirname,'./dist'),
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
  resolveLoaderModule: [],
  loaders: [
    {
      test: /\.js(x)?/g,
      use: 'babel-loader',
    },
    {
      test: /\.css/g,
      use: 'css-loader',
    }
  ],
  plugins: ['wrapPlugin','outputPlugin'],

  webPConfig: {

  },
  wxPConfig: {

  }
});
