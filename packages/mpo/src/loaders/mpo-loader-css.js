module.exports = function cssLoader (item,config) {
  if(config.isWrapItem === false) return
  item.content = `function _addStyle(str){}; _addStyle('${item.content}; module.exports = {}')`
}
