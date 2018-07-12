module.exports = function cssLoader (item,options,config) {
  options = Object.assign({
    isToJs: true
  },options);
  if(options.isToJs === true){
    item.content = `function _addStyle(str,id){
      id = 'mpo_style_'+id;
      var style = document.getElementById(id);
      if(style){
          return style.innerText = str;
      }
      style = document.createElement('style');
      style.id = id
      style.innerText = str;
      document.body.append(style)
    }; _addStyle(${JSON.stringify(item.content)},${item.id});module.exports = {};`
  }
}
