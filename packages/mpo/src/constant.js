module.exports.loaders = {
  'css-loader': require('../loaders/mpo-loader-css'),
  'json-loader': require('../loaders/mpo-loader-json'),
  'less-loader': require('../loaders/mpo-loader-less'),
  'babel-loader': require('../loaders/mpo-loader-babel'),
  'main-loader': require('../loaders/mpo-loader-main'),
  'text-loader': require('../loaders/mpo-loader-text'),
}

module.exports.plugins = {
  'outputPlugin': require('../plugins/outputPlugin'),
  'hotPlugin': require('../plugins/hotPlugin'),
  'watchPlugin': require('../plugins/watchPlugin'),
  'serverPlugin': require('../plugins/serverPlugin'),
  'wrapPlugin': require('../plugins/wrapPlugin'),
}
