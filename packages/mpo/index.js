/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Compiler = require("./src/compiler");
const version = require("./package.json").version;
const mpo = (options,cb) => {
  return new Compiler(options,cb)
};
let exports = module.exports = mpo;
exports.version = version;
exports.Compiler = Compiler;
const exportPlugins = (obj, mappings) => {
  for (const name of Object.keys(mappings)) {
    Object.defineProperty(obj, name, {
      configurable: false,
      enumerable: true,
      get: mappings[name]
    });
  }
};
exportPlugins(exports.loaders = {},{
  less: require('../loaders/mpo-loader-babel'),
  babel: require('../loaders/mpo-loader-less')
});


