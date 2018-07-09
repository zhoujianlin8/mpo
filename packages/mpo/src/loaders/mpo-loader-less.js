const fs = require('fs')
const less = require('less');
module.exports = function lessLoader (item, config) {
  return new Promise((resolve, reject) => {
    less.render(item.content, config).then((res, imports) => {
      item.content = res.css;
      item.deps = {};
      item.isContentDeps = true;
      resolve();
    }).catch((e)=>{
      console.error(e);
      resolve();
    })
  })
}
