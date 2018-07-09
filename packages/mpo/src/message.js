/**
 * Created by zhou
 */
class Message {
  constructor() {
    this._listeners = {}
  }

  //_listeners = {};//{'a':[fn, fn,fn],'b':[fn,fn]}
  on(name, fn) {
    const listenerItem = this._listeners[name] || [];
    fn = fn || function () {
    };
    listenerItem.push(fn);
    this._listeners[name] = listenerItem;
    return this;
  };

  off(name, fn) {
    if (fn === undefined) {
      delete this._listeners[name];
      return this;
    }
    const listenerItem = this._listeners[name] || [];
    const newArr = [];
    listenerItem.forEach((item) => {
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
      const len = listenerItem.length;
      async function exec(index) {
        if (len < index) return
        const item = listenerItem[index];
        item && await item(...props);
        index++;
        await exec(index);
      }
      await exec(0);
    }
    return this;
  }
}

module.exports = Message
