var x = 1;
var obj = {
  x: 2,
  say: function(){
    console.log('say=',this.x)
  },
  hello: ()=>{
    console.log('hello=',this.x)
  },
  hi: function(){
    var fn = ()=>{
      setTimeout(function(){
        console.log('hisetTimeout',this.x)
      },0)
    }
    fn()
  },
  world: function(){

    setTimeout(function(){
      console.log('word',this.x)
    },0)
  },

  world2: function(){

    setTimeout(()=>{
      console.log('world2',this.x)
    })
  }

}
obj.say();
obj.hello();
var objHello = obj.hello;
objHello();
obj.hi();
obj.world();
obj.world2()
