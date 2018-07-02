/**
 * Created by zhou
 */
class Message {
  constructor(){
    this._listeners = {}
  }
  //_listeners = {};//{'a':[fn, fn,fn],'b':[fn,fn]}
  on (name, fn) {
    const listenerItem = this._listeners[name] || [];
    fn = fn || function () {
    };
    listenerItem.push(fn);
    this._listeners[name] = listenerItem;
    return this;
  };
  off (name, fn) {
    if (fn === undefined) {
      delete this._listeners[name];
      return this;
    }
    const listenerItem = this._listeners[name] || [];
    const newArr = [];
    listenerItem.forEach((item)=> {
      if (item !== fn) {
        newArr.push(item)
      }
    });
    this._listeners[name] = newArr;
    return this;
  };
  // 按顺序执行
  async fire(name, ...props) {
    let listenerItem = this._listeners[name];
    if (listenerItem) {
      async function exec() {
        if(!listenerItem.length) return
        const item = listenerItem.shift();
        await item(...props)
        await exec();
      }
      await exec();
    }
    return this;
  }
}
module.exports = Message
