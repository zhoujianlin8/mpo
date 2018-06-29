module.exports = function jsonLoader (item,config) {
  if(config.isWrapItem === false) return;
  item.content = `module.exports = 'JSON.stringify('${item.content}')`
}
