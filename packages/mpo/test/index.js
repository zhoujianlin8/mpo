const mpo = require('../index');
const path = require('path');
mpo({
  entry: {
    'app': path.join(__dirname,'/app.js'),
    'app.css': path.join(__dirname,'/app.less'),
  },
  output: {
    path:  path.join(__dirname,'/dist'),
    filename: '[name].[ext]',
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
  isWatch: true,
  //扩展名称
  extensions: ['.js', '.jsx'],

  platform: ['web'],
  isServer: true,
  resolveLoaderModule: [],
  loaders: [
    {
      test: /\.js(x)?$/g,
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
    },{
      test: /\.less$/g,
      use: 'less-loader'
    }
  ],
  plugins: ['wrapPlugin','outputPlugin'],
  webPConfig: {

  },
  wxPConfig: {

  }
},()=>{
  setTimeout(()=>{
    console.log(222)
  },20000)
});
process.on('exit',function () {
  console.log('end')
})

