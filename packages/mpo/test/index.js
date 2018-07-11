const mpo = require('../index');
const path = require('path');
mpo({
  entry: {
    'app': path.join(__dirname,'/app.js'),
    'app.css': path.join(__dirname,'/app.less'),
    'index.html': path.join(__dirname,'/index.html'),
  },
  output: {
    path:  path.join(__dirname,'/dist'),
    filename: '[name].[ext]',
    library: 'wm.a',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: {
      'react': 'rax'
    },
    //忽略替代
    externals: {
      jquery: 'jQuery',
      react: 'React'
    },
    extensions: ['.js', '.jsx'],
    removePaths: /^\.(css|less)$/g,
    ignoreParses: /^(fs)|(path)|(react)$/g,
  },
  //别名或其他路径
  isWatch: true,
  //扩展名称
 // isHot: true,
  platform: ['web'],
 // isServer: true,
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

});

process.on('exit',function () {
  console.log('end')
})

