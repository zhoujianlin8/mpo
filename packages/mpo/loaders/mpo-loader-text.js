module.exports = function textLoader (item,config) {
  if(config.isWrapItem === false) return
  item.content = `module.exports = '${item.content}'`
}
