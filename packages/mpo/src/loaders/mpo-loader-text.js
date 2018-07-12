module.exports = function textLoader (item,options,config) {
  options = Object.assign({
    isToJs: true
  },options);
  if(options.isToJs === true){
    item.content = `module.exports = '${item.content}'`
  }
}
