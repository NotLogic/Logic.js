var Logic = {
  // 基于localStorage的定时缓存，对于不支持localStorage的环境，return false
  timingCache: {
    // 传参 
    // arguments.length == 2时  arguments[0] instanceOf Object,arguments[0] instanceOf Object
    // arguments.length == 3  
    set: function(){
      var arg = arguments,len=arguments.length
      time = arg[len-1]
      if(!time || isNaN(time)){time=0;}
      // 有效时间为时间戳
      var key,val,effectiveTime = Date.now() + time*24*60*60
      if(len==2){
        var obj = arg[0]
        for(key in obj){
          val = obj[key]
          localStorage[key] = JSON.stringify({
            val: val,
            time: effectiveTime
          })
        }
      }else if(len==3){
        key = arg[0],val=arg[1]
        localStorage[key] = JSON.stringify({
          val: val,
          time: effectiveTime
        })
      }else{
        return false
      }
    },
    get: function(key){
      try{
        if(!localStorage){return false;}
        var cacheVal = localStorage.getItem(key);
        var result = JSON.parse(cacheVal);
        var now = Date().now()
        if(!result){return null;}//缓存不存在
        if(now>result.time){//缓存过期
          this.remove(key);
          return "";
        }
        return result.val;
      }catch(e){
        this.remove(key);
        return null;
      }
    },
    remove: function(key){
      if(!localStorage){return false;}
		  localStorage.removeItem(key);
    },
    clear: function(){
      if(!localStorage){return false;}
		  localStorage.clear();
    }
  },
  // 深度复制
  deepcopy (source) {
    if (!source) {
      return source;
    }
    var sourceCopy = source instanceof Array ? [] : {};
    for (var item in source) {
      sourceCopy[item] = typeof source[item] === 'object' ? deepcopy(source[item]) : source[item];
    }
    return sourceCopy;
  },
  isNullObject(obj){
    if(obj instanceof Array){
      return !!obj.length
    }else if (obj instanceof Object) {
      for(var key in obj) {
        return false;
      }
      return true;
    }else{
      throw new Error('arguments type need Object!')
    }
  },
  isUrl: function (string) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(string);
  }
}