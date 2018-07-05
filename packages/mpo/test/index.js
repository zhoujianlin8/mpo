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
    jquery: 'jQuery',
    react: 'React'
  },
  //扩展名称
  extensions: ['.js', '.jsx'],

  platform: ['web'],
  isServer: true,
  resolveLoaderModule: [],
  loaders: [
    {
      test: /\.js(x)?/g,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [ require("@babel/preset-react") ],
          /*plugins: [[require("@babel/plugin-transform-runtime"),
            {
              "helpers": false,
              "polyfill": false,
              "regenerator": true,
              //"moduleName": moduleName()
            }
          ]],*/
        }
      }]
    }
  ],
  plugins: ['wrapPlugin','outputPlugin'],
  webPConfig: {

  },
  wxPConfig: {

  }
});
