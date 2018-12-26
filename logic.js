var Logic = {
  // 基于localStorage的定时缓存，对于不支持localStorage的环境，return false
  timingCache: {
    // 传参 
    // arguments.length == 2时  arguments[0] instanceOf Object,arguments[0] instanceOf Object
    // arguments.length == 3  
    set: function () {
      var arg = arguments, len = arguments.length
      time = arg[len - 1]
      if (!time || isNaN(time)) { time = 0; }
      // 有效时间为时间戳
      var key, val, effectiveTime = Date.now() + time * 24 * 60 * 60
      if (len == 2) {
        var obj = arg[0]
        for (key in obj) {
          val = obj[key]
          localStorage[key] = JSON.stringify({
            val: val,
            time: effectiveTime
          })
        }
      } else if (len == 3) {
        key = arg[0], val = arg[1]
        localStorage[key] = JSON.stringify({
          val: val,
          time: effectiveTime
        })
      } else {
        return false
      }
    },
    get: function (key) {
      try {
        if (!localStorage) { return false; }
        var cacheVal = localStorage.getItem(key);
        var result = JSON.parse(cacheVal);
        var now = Date().now()
        if (!result) { return null; }//缓存不存在
        if (now > result.time) {//缓存过期
          this.remove(key);
          return "";
        }
        return result.val;
      } catch (e) {
        this.remove(key);
        return null;
      }
    },
    remove: function (key) {
      if (!localStorage) { return false; }
      localStorage.removeItem(key);
    },
    clear: function () {
      if (!localStorage) { return false; }
      localStorage.clear();
    }
  },
  // 深度复制
  deepcopy: function(source) {
    if (!source) {
      return source;
    }
    var sourceCopy = source instanceof Array ? [] : {};
    for (var item in source) {
      sourceCopy[item] = typeof source[item] === 'object' ? deepcopy(source[item]) : source[item];
    }
    return sourceCopy;
  },
  // JQ isPlainObject
  isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = Object.getPrototypeOf( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}
    var class2type = {};
    var hasOwn = class2type.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var ObjectFunctionString = fnToString.call( Object );
		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = class2type.hasOwnProperty.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},
  // JQ extend
  extend: function () {
    var options, name, src, copy, copyIsArray, clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
      deep = target;

      // Skip the boolean and the target
      target = arguments[i] || {};
      i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !this.isFunction(target)) {
      target = {};
    }

    // Extend jQuery itself if only one argument is passed
    if (i === length) {
      target = this;
      i--;
    }

    for (; i < length; i++) {

      // Only deal with non-null/undefined values
      if ((options = arguments[i]) != null) {

        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];

          // Prevent never-ending loop
          if (target === copy) {
            continue;
          }

          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (this.isPlainObject(copy) ||
            (copyIsArray = Array.isArray(copy)))) {

            if (copyIsArray) {
              copyIsArray = false;
              clone = src && Array.isArray(src) ? src : [];

            } else {
              clone = src && this.isPlainObject(src) ? src : {};
            }

            // Never move original objects, clone them
            target[name] = this.extend(deep, clone, copy);

            // Don't bring in undefined values
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }

    // Return the modified object
    return target;
  },
  isFunction: function(obj){
    return this.type( obj ) === "function";
  },
  type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
    var class2type = {};
		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},
  isNullObj: function (obj) {
    if(typeof obj != 'object') return false
    if(typeof obj.length == 'undefined'){
      for(var key in obj){
        return false
      }
      return true
    }else{
      return obj.length == 0 ? true : false
    }
  },
  isUrl: function (string) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(string);
  },
  // 除去数组中字符串元素的首尾空格
  trimArray: function (arr) {
    var ret = this.deepcopy(arr)
    if(ret instanceof Array){
      var _ret = [],i,len=ret.length,item
      for(i=0; i<len; i++){
        item = ret[i]
        if(typeof item === 'string'){
          _ret.push(item.trim())
        }else{
          _ret.push(item)
        }
      }
      ret = _ret
    }
    return ret
  },
  // 前置扩展某方法
  prependFn: function (fn, prevfn) {
    return function () {
      prevfn.apply(this, arguments)
      return fn.apply(this, arguments)
    }
  },
  // 后置扩展某方法
  appendFn: function (fn, nextfn) {
    return function () {
      fn.apply(this, arguments)
      return nextfn.apply(this, arguments)
    }
  },
  // 复制字符串
  str_repeat: function (str, num) {
    return new Array(num + 1).join(str);
  },
  // 时间戳转时间
  timestampToTime(timestamp) {
    if(typeof timestamp == 'string'){
      return timestamp
    }
    var timeStr = '' + timestamp;
    var myTimestamp = timeStr.length == 10 ? timestamp*1000 : timestamp;
    var date = new Date(myTimestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate()<10 ? '0'+date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours()<10 ? '0'+date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds()<10 ? '0'+date.getSeconds() : date.getSeconds());
    return Y+M+D+h+m+s;
  },
  // base64转文件
  dataURLtoFile: function (dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  },
  // base64转blob数据
  dataURLtoBlob: function (dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  },
  // 时间格式化
  dateFormat: function (fmt, date){ 
    var o = {   
      "M+" : date.getMonth()+1,                 //月份   
      "d+" : date.getDate(),                    //日   
      "H+" : date.getHours(),                   //小时   
      "m+" : date.getMinutes(),                 //分   
      "s+" : date.getSeconds(),                 //秒   
      "q+" : Math.floor((date.getMonth()+3)/3), //季度   
      "S"  : date.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(fmt))   
      fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
    for(var k in o)   
      if(new RegExp("("+ k +")").test(fmt))   
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
    return fmt;   
  },
  // 评论时间
  commentTime: function(date){
    var oldTime = new Date().getTime();
    if(typeof date === 'string'){
      oldTime = new Date(date).getTime();
    }else if(date instanceof Object){
      oldTime = date.getTime();
    }else if(typeof(date) == 'number'){
      var _date = '' + date
      oldTime = _date.length == 10 ? _date * 1000 : Number(_date)      
    }
    var now = new Date().getTime(),
    difference = now - oldTime,
    result='',
    minute = 1000 * 60,
    hour = minute * 60,
    day = hour * 24,
    halfamonth = day * 15,
    month = day * 30,
    year = month * 12,
    _year = difference/year,
    _month =difference/month,
    _week =difference/(7*day),
    _day =difference/day,
    _hour =difference/hour,
    _min =difference/minute;

    if(_year>=1) {
      result= "发表于 " + ~~(_year) + " 年前"
    }else if(_month>=1) {
      result= "发表于 " + ~~(_month) + " 个月前"
    }else if(_week>=1) {
      result= "发表于 " + ~~(_week) + " 周前"
    }else if(_day>=1) {
      result= "发表于 " + ~~(_day) +" 天前"
    }else if(_hour>=1) {
      result= "发表于 " + ~~(_hour) +" 个小时前"
    }else if(_min>=1) {
      result= "发表于 " + ~~(_min) +" 分钟前"
    } else {
      result="刚刚";
    }
    return result;
  },
  // 检查是不是IE浏览器，如果传版本的话判断是否高于此版本 版本为整数版本5，7，8，9，10，11
  checkIEVersion: function(version){
    // var navigatorAppVersion = {
    //   ie5     : "4.0 (compatible; MSIE 7.0;   Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie7     : "4.0 (compatible; MSIE 7.0;   Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie8     : "4.0 (compatible; MSIE 8.0;   Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie9     : "5.0 (compatible; MSIE 9.0;   Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie10    : "5.0 (compatible; MSIE 10.0;  Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie11    : "5.0 (                        Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko",
    //   chrome  : "5.0 (Windows NT 10.0; WOW64)       AppleWebKit/537.36    (KHTML, like Gecko) Chrome/70.0.3538.110  Safari/537.36",
    //   firefox : "5.0 (Windows)",
    //   edge    : "5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36    (KHTML, like Gecko) Chrome/64.0.3282.140  Safari/537.36     Edge/17.17134",
    //   opera   : "5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36    (KHTML, like Gecko) Chrome/69.0.3497.100  Safari/537.36     OPR/56.0.3051.116",
    //   safari  : "5.0 (Windows NT 6.2; WOW64)        AppleWebKit/534.57.2  (KHTML, like Gecko) Version/5.1.7         Safari/534.57.2",
    //   360     : "5.0 (Windows NT 10.0; WOW64)       AppleWebKit/537.36    (KHTML, like Gecko) Chrome/63.0.3239.132  Safari/537.36",
    // }
    // var navigatorUserAgent = {
    //   ie5     : "Mozilla/4.0 (compatible; MSIE 7.0;   Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie7     : "Mozilla/4.0 (compatible; MSIE 7.0;   Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie8     : "Mozilla/4.0 (compatible; MSIE 8.0;   Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie9     : "Mozilla/5.0 (compatible; MSIE 9.0;   Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie10    : "Mozilla/5.0 (compatible; MSIE 10.0;  Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    //   ie11    : "Mozilla/5.0 (                        Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko",
    //   chrome  : "Mozilla/5.0 (Windows NT 10.0; WOW64)               AppleWebKit/537.36    (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
    //   firefox : "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0",
    //   edge    : "Mozilla/5.0 (Windows NT 10.0; Win64; x64)          AppleWebKit/537.36    (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134",
    //   opera   : "Mozilla/5.0 (Windows NT 10.0; Win64; x64)          AppleWebKit/537.36    (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36 OPR/56.0.3051.116",
    //   safari  : "Mozilla/5.0 (Windows NT 6.2; WOW64)                AppleWebKit/534.57.2  (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
    //   360     : "Mozilla/5.0 (Windows NT 10.0; WOW64)               AppleWebKit/537.36    (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36"
    // }
    var ret = false
    var userAgent = window.navigator.userAgent.toUpperCase()
    if(userAgent.indexOf('MSIE') > -1){
      if(typeof(version) == 'number'){
        var arr = userAgent.split(';')
        for(var i=0;i<arr.length;i++){
          if(arr[i].indexOf('MSIE') > -1){
            var _version = parseInt(arr[i].split('MSIE')[1])
            ret = !!(_version > version)
          }
        }
      }else{
        ret = true
      }
    }
    return ret
  }
}