const fs = require('fs')
const less = require('less');
module.exports = function lessLoader (item, options) {
  return new Promise((resolve, reject) => {
    less.render(item.content || '', options).then((res, imports) => {
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
