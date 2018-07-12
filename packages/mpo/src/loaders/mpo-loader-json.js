module.exports = function jsonLoader (item,options,config) {
  options = Object.assign({
    isToJs: true
  },options);
  if(options.isToJs === true){
    item.content = `module.exports = 'JSON.stringify('${item.content}')`
  }
}
