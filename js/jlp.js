(function (){
    var JLP = function( selector) { 
        
        function Constructor( selector ) {
            this.selector = "";
            this.length = 0;
            this.elems = [];
            this.QueueAnimFunc = [];
            this.first = 0;
            if ( !selector ) {
                return this;
            }
            if ( typeof selector === "string" ) {
                selector = selector.replace(/\s+/gm,'');
                var e = [],
                    res = [];
                e = selector.split(",");
                var elem;
                var len = 0;
                var k = 0;
                if ( e.length > 1 ){
                    for (var j = 0; j < e.length; j++ ){
                        res[j] = JLP(e[j], true);
                        
                        len += res[j].length;
                        for (var i = 0; i < res[j].length; i++)
                            this.elems[k++] = res[j].elems[i];
                    }
                    this.length = len;
                    this.selector = selector;
                    
                } else {
                    // Easily-parseable/retrievable ID or TAG or CLASS selectors
                    var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))(?:\[([\w\-]+)=\*(\w+)\]){0,}/g;
                    var elem;
                    match = rquickExpr.exec(selector);
                    //console.log(match);
                    // JLP("#ID")
                    if ( match[1])  {
                        elem = document.getElementById(match[1]);
                        if( elem ){
                            this.elems[0] = elem;
                            this.length = 1;
                        }
                    } else {
                        
                        // JLP(".CLASS")
                        if ( match[3] ) {
                            var res = [];
                            if(document.getElementsByClassName)
                                elem =  document.getElementsByClassName( match[3] );
                            else
                                elem = document.querySelectorAll(match[3]);
                        // JLP("TAG")
                        } else if ( match[2] ) {
                            elem = document.getElementsByTagName( match[2] );
                        } 
                        //JLP(.CLASS[attr = value]) or JLP(TAG[attr = value])
                        if ( elem ){
                            var res = [];var c=0;
                            if( match[4] ){
                                for ( var i = 0; i < elem.length; i++ ){
                                    var d = elem[i].getAttribute(match[4]);
                                    if( d && d.indexOf(match[5]) !== -1  ){
                                        res.push(i);
                                    } else {
                                        if( match[4] === match[5])
                                            if(elem[i][match[4]]){
                                                res.push(i);
                                        }
                                    }      
                                }
                                if(res.length){
                                    for ( var i = 0; i < res.length; i++ )
                                        this.elems[i] = elem[res[i]];
                                }
                                this.length = res.length;
                            } else {
                                for ( var i = 0; i < elem.length; i++ )
                                    this.elems[i] = elem[i];
                                this.length = elem.length;
                            }
                        }
                    }
                }
                
            // HANDLE: $(DOMElement)
            } else if ( selector.nodeType ) {
                this.elems[0] = selector;
                this.length = 1;
                
            // HANDLE: $(function)
            } else if ( typeof selector === "function" ) {
                return selector( JLP );
            }
            
            this.selector = selector;
            if (!JLP.arguments[1]){
                var ind = JLP.inArray(this, stackOfJLPobjects);
                if(ind === -1){
                    stackOfJLPobjects.push(this);
                } else {
                    var ob = stackOfJLPobjects[ind];
                    ob.selector = selector;
                    return ob;
                }
            }
            return this;
        };
        
       
        Constructor.prototype = JLP.prototype;
        return new Constructor( selector);
    };  
    
    JLP.prototype = {	
    
        constructor : JLP,

        hide : function (dur ){
            dur = dur||1;
            addToQueueOfAnimFunc(this, dur, hideHelper);
            return this;
        },
        show : function(dur){
            dur = dur||1;
            addToQueueOfAnimFunc(this, dur, showHelper);
            return this;
        },
        fadeOut : function(dur){
            dur = dur||400;
            addToQueueOfAnimFunc(this, dur,fadeOutHelper);
            return this;
        },
        fadeIn : function (dur){
            dur = dur||400;
            addToQueueOfAnimFunc(this, dur,fadeInHelper);        
            return this;
        },
        slideUp : function (dur){
            dur = dur||400;
            addToQueueOfAnimFunc(this, dur,slideUpHelper);     
            return this;
        },
        slideDown : function (dur){
            dur = dur||400;
            addToQueueOfAnimFunc(this, dur,slideDownHelper);
            return this;
        },
        animate : function(obj, dur){
            
            dur = dur||400;
            addToQueueOfAnimFunc(this, dur, animateHelper, obj);     
            return this;
        }
        
    };
    var stackOfJLPobjects = [];
 
    
    JLP.prototype.eq = function (i){
        return JLP(this.get(i),true);
    };
    
    JLP.prototype.get = function (i){
        return this.elems[i];
    };
    
    JLP.prototype.each = function (callback){ 
    
        for (var i = 0; i < this.length; i++){
            var f = JLP.bind( callback, this.get(i));
            f(i, this.get(i));
        }
        return this;
    };
    
    JLP.prototype.html = function (){
        var d = arguments[0];
        if (arguments.length)
            this.each(function(){
                this.innerHTML = d;
            });
        return this.get(0).innerHTML;
    }; 
    
    JLP.prototype.setStyle = function ( prop, value){
        
        if (JLP.isObject(prop)){ 
            for(var i = 0; i < this.length; i++){
                for (var key in prop) 
                    this.get(i).style[key] = prop[key];
            }
            
        } else if (JLP.isArray(prop)){
            this.setStyle(prop[0],prop[1]);
            
        } else { 
            for(var i = 0; i < this.length; i++){
                this.get(i).style[prop] = value;
            }
        } 
        return this;
    };
    
    //all the anim. methods (hide/show,animate/... ) call this method.... it also helps to realize the queue mechanism.
    var anim = function (obThis, obj, duration, callback, firstob, ith){
         
        if(duration >= 100){
            var count = 100;
        } else {
            var count = duration;
        }
        var setObj = [],
            object = [];
        obThis.itercount = 1;
        //realisation of the animation....
        setTimeout(function(){
            
            if (obThis.itercount === 1){
                object = [];
                for(var i = 0; i < obThis.length; i++){
                    var ob = {};
                    for (var key in obj){
                        var d1 = obThis.eq(i).getStyle(key);
                        var val = (parseFloat(d1)>= 0)? parseFloat(d1) : 1;
                        var st = (parseFloat(obj[key])- val)/count;
                        var oper = (st > 0 )? true: false;
                        ob[key] = {
                            value: val,
                            op: oper, 
                            step: st
                        };
                    }
                    object[i] = ob;
                }
            } else {
                setObj = [];
                for(var i = 0; i < obThis.length; i++){
                    var ob = {};
                    for ( var key in obj ){
                        var oldValue = object[i][key]["value"] ;
                        var stepVal =  object[i][key]['step'];
                        var newValue = oldValue + stepVal;
                        object[i][key]["value"] = newValue;
                        var str = /px|em|pt/gi.exec(obj[key]);
                        ob[key] = object[i][key]["value"]+str;
                    }
                    setObj[i] = ob;
                }
            }
            var value = object[0][key]["value"] ;
            var op = object[0][key]['op'];
            //check if still need to make a recursive call...
            if( op && value <= parseFloat(obj[key]) || !op && value >= parseFloat(obj[key]) ){
                    
                for (var i = 0; i < obThis.length; i++){
                    obThis.eq(i).setStyle(setObj[i]);
                }
                obThis.itercount ++;
                setTimeout(arguments.callee,duration/count);
            } else {
                
                if (callback){
                    callback();
                } 
                //firstob need for internal use only.(helps to detect the current method's end)
                if(firstob){
                    obThis = firstob;
                }
                
                if(!ith && ith!==0 && obThis.QueueAnimFunc.length || ith === obThis.length-1 ){
                    obThis.QueueAnimFunc.shift();
                    if((obThis.QueueAnimFunc.length)){
                        var d = obThis.QueueAnimFunc[0];
                        //if there is any method left in queue call it...
                            d.func(obThis,d.durat, d.settings);
                    }
                }
                //show that queue is empty
                obThis.first = 0;
            }
        }, 5); 
    };
    
    JLP.prototype.getStyle = function (prop){
       function f(elem,prop){
            return window.getComputedStyle ?
                getComputedStyle(elem, "").getPropertyValue(prop) :
                elem.currentStyle[prop]; 
        }
        if(this.length)
             var d = f(this.get(0), prop);
        return d;
    }; 
    
    var animateHelper = function(ob, dur, set){
        
        anim(ob, set, dur, function(){
            ob.setStyle(set);
        });
    };
    
    var hideHelper = function(ob, dur){
        //make ready for animation
        if(ob.eq(0).getStyle('display') !== "none"){
            ob.setStyle({ overflow: "hidden"});
            var w = [],
                h = [],
                op = [];
            for(var i = 0; i < ob.length; i++){
                h[i]  = ob.eq(i).getStyle('height');
                w[i] =  ob.eq(i).getStyle('width');
                op[i] =  ob.eq(i).getStyle("opacity");
            }
            
            //now make the animation, and the callback function sets the 
            //initial style( before changing in animate)
            // and just sets the display prop to none.
            anim(ob, {
                    width: '0px',
                    height: '0px',
                    opacity: 0
                }, 
                dur,
                function(){
                    for(var i = 0; i < ob.length; i++ ){
                        ob.eq(i).setStyle({
                            width: w[i],
                            height: h[i],
                            opacity: op[i],
                            "display":"none"
                        });
                    }
                }
            );
        }
    };
    
    var showHelper = function(ob, dur){
       
        if(ob.length && ob.eq(0).getStyle('display') === "none"){

            ob.setStyle({
                display:"block",
                overflow: "hidden"
            });
            var w = [],
                h = [],
                op = [];
            for (var i = 0; i < ob.length; i++){
                h[i] = ob.eq(i).getStyle('height');
                w[i] = ob.eq(i).getStyle('width');
                op[i] = ob.eq(i).getStyle("opacity");
            } 
            ob.setStyle({
                opacity: 0,
                width:'0px',
                height:"0px"
            });

            for(var i = 0; i < ob.length ; i++) {
                f(i);
            }
            function f(i){
                anim(ob.eq(i), {
                    width: w[i],
                    height: h[i],
                    opacity: op[i]
                    },
                    dur,
                    function(){
                        ob.eq(i).setStyle({
                            width: w[i],
                            height: h[i],
                            opacity: op[i],
                            "display":"block"
                        });
                    },ob,i
                );
            }
        }
        
        
    };
     
    var fadeOutHelper = function(ob, dur){
        
        if(ob.length && ob.eq(0).getStyle('display') !== "none"){ 
            var  op = [];
            for(var i =0; i < ob.length ; i++) {
                op[i] = ob.eq(i).getStyle('opacity');
            }
            anim(ob, {
                    opacity: 0
                }, 
                dur, 
                function (){
                    for(var i =0; i < ob.length ; i++) {
                        ob.eq(i).setStyle({
                            opacity: op[i],
                            display: "none"
                        });
                    }
            });
        }  
    };
    var fadeInHelper = function(ob, dur){

        if(ob.length && ob.eq(0).getStyle('display') === "none"){
            var op = [];
            for(var i =0; i < ob.length ; i++) {
                op[i] = ob.eq(i).getStyle("opacity");
            }
            ob.setStyle({
                opacity: 0,
                display: "block"
            });
            for(var i = 0; i < ob.length ; i++) {
                f(i);
            }
            function f(i){
                anim(ob.eq(i), {
                        opacity: op[i]
                    },
                    dur,
                    function(){
                        ob.eq(i).setStyle({
                            opacity: op[i]
                        });
                    },ob,i
                );
            }
        }

    };
    var slideUpHelper = function(ob, dur){
        
        if(ob.eq(0).getStyle('display') !== "none"){
            ob.setStyle({ 
                'overflow': "hidden"
            });
            var h = [],
                op = [],
                padTop = [],
                padBott = [];
            for(var i =0; i < ob.length ; i++) {
                h[i] =  ob.eq(i).getStyle('height');
                op[i] =  ob.eq(i).getStyle("opacity");
                padTop[i] =  ob.eq(i).getStyle("padding-top");
                padBott[i] =  ob.eq(i).getStyle("padding-bottom");
            }
            anim(ob, {
                    height: '0px',
                    'padding-top': '0px',
                    'padding-bottom': '0px',
                    opacity: 0
                }, 
                dur,
                function(){
                    for(var i =0; i < ob.length ; i++) {
                        ob.eq(i).setStyle({
                            height: h[i],
                            opacity: op[i],
                            'padding-top': padTop[i],
                            'padding-bottom': padBott[i],
                            "display":"none"
                        });
                    }
                }
            );
        }
        
    };
    var  slideDownHelper = function(ob, dur){
        
        if(ob.length && ob.eq(0).getStyle('display') === "none"){
            ob.setStyle({
                display: "block",
                overflow: "hidden"
            });

            var h = [];
            for(var i =0; i < ob.length ; i++) {
                h[i] =  ob.eq(i).getStyle('height');
            }
            ob.setStyle({
                height: "0px"
            });                
            for(var i = 0; i < ob.length ; i++) {
                f(i);
            }
            function f(i){
                anim(ob.eq(i), {
                        height: h[i]
                    },
                    dur,
                    function(){
                        ob.eq(i).setStyle({
                            height: h[i],
                            "display":"block"
                        });
                    },ob,i
                );
            }
        } 
    };
    JLP.isFunction = function(arg) {
        return typeof arg === 'function';
    };
    //creates the queue of anim.methods...
    //important in their chain calls...
    var addToQueueOfAnimFunc = function (ob, dur, func, set){
        var  f = {};
        if(JLP.isFunction(func)){
            var fun = {
                func:func,
                durat : dur,
                settings:set
            };
            ob.QueueAnimFunc.push(fun);
        }
        //if the queue was empty and pushed the first method in chain call it...
        if(ob.QueueAnimFunc.length  && ob.first===0){
            f = ob.QueueAnimFunc[0];
            f.func(ob, f.durat,f.settings);
            ob.first++;
        }
    };

    
    JLP.prototype.on = function ( event ,callback){
        if (this.get(0).attachEvent){
            for ( var i = 0; i < this.length; i++)
                this.get(i).attachEvent("on"+event, JLP.bind(callback, this.get(i)));
        } else if (this.get(0).addEventListener) {
            for ( var i = 0; i < this.length; i++)
                this.get(i).addEventListener(event, JLP.bind(callback, this.get(i)));
        }
    };
//the textHelper function it helps to detect textNodes...
    var  getTextNodes = function (n){
        var t =[],
            d;
        rec(n);
        function rec(n){
            d = n.childNodes;
            var r = d.length;
            for(var i=0; i<r ; i++){
               if (d[i].nodeType === 3){
                    t.push(d[i].nodeValue);
                }
            }
            var ch = n.children;
            if(ch)
                for(var i =0 ; i< ch.length; i++)
                    rec(ch[i]);
        }
        return t.join(" ");   
    };
    
    JLP.prototype.text = function(arg){
        if(arguments.length){
            for(var i=0; i < this.length; i++)
            this.get(i).innerHTML = arg;
            
        } else {
            var d = this.get(0);         
            var t = getTextNodes(d);
            return t;
        }
    };
    
    var hasClassHelper = function(element, className){
        var currentClassValue = element.className;
        if (currentClassValue.indexOf(className) === -1)
            return false;
        return true;
    };
    
    JLP.prototype.hasClass = function(className){
        for(var i=0; i<this.length; i++){
            var has = hasClassHelper(this.get(i), className);
            if(!has) return false;
        }
        return true;
    };
    
    
    var addClassHelper = function (element, classToAdd) {
        var currentClassValue = element.className;
        
        if ( !hasClassHelper(element,classToAdd) ) {
            if ((currentClassValue == null) || (currentClassValue === "")) {
                element.className = classToAdd;
            } else {
                element.className += " " + classToAdd;
            }
        }
    };

    JLP.prototype.addClass = function(classToAdd){
        if(! this.hasClass(classToAdd))
            for(var i=0; i< this.length; i++)
                addClassHelper(this.get(i), classToAdd);
        return this;
    } ;
    
    
    
    var  removeClassHelper = function (element, classToRemove) {
        var currentClassValue = element.className;

        if (currentClassValue === classToRemove) {
            element.className = "";
            return;
        }
        
        if( hasClassHelper(element,classToRemove))
            var filteredList = currentClassValue.replace(" " + classToRemove,"");

        element.className = filteredList;
    };
    
    JLP.prototype.removeClass = function(classToRemove){
                    
        if(this.hasClass(classToRemove))
            for(var i=0; i<this.length; i++)
                removeClassHelper(this.get(i), classToRemove);
        return this;
    };
       var toString = {}.toString;
    
    JLP.isNumber = function (arg){
        return toString.call(arg) === "[object Number]" &&  !isNaN(arg) && isFinite(arg);
    };
    
    JLP.isString = function (arg){
        return toString.call(arg) === "[object String]";
    }; 
    
    JLP.isBoolean = function (arg){
        return toString.call(arg) === "[object Boolean]";
    };
    
    JLP.isObject = function (arg){
        return toString.call(arg) === "[object Object]";
    };
    
    JLP.isArray = function (arg){
        return toString.call(arg) === "[object Array]";
    }; 
    
    JLP.isNull = function (arg){
        return toString.call(arg) === "[object Null]";
    };
    //merges obj1 and obj2 into obj1
    //the overwrite parametres(true by default)- says wheter change the same keys values (if true)
    //or not(if false).
    JLP.merge  = function (obj1, obj2, overwrite) {
        
        overwrite = JLP.isBoolean(overwrite)?overwrite:true ;
        var exists = function(a){
            for(var key in obj1)
                if(key === a)
                    return true;
            return false;
        };
        for(var key in obj2){
            if(overwrite){
                obj1[key] = obj2[key];
            } else if(!exists(key) ){
                obj1[key] = obj2[key];
            } 
        }
        return obj1;    
    };
    ( function() {
        var el = document.documentElement;
        if (!el.compareDocumentPosition && el.sourceIndex !== undefined) {

          Element.prototype.compareDocumentPosition = function(other) {
            return (this != other && this.contains(other) && 16) +
              (this != other && other.contains(this) && 8) +
              (this.sourceIndex >= 0 && other.sourceIndex >= 0 ?
                (this.sourceIndex < other.sourceIndex && 4) +
                (this.sourceIndex > other.sourceIndex && 2) : 1
              ) + 0;
          };
        }
      })();
      
    //detects
    var equal = function (objToCompare, objWith){
        
        if (objWith instanceof JLP){
            if ( objWith.length !== objToCompare.length)
                return false;
            else
            for (var i = 0; i < objWith.length; i++){
                var s = objWith.get(i).compareDocumentPosition(objToCompare.get(i)); 
                if(s !== 0 )
                    return false;
            }
        }else if(objToCompare.nodeType){
            var s = objWith.compareDocumentPosition(objToCompare);
            if(s !== 0 )
                return false; 
        } else {
			if(!JLP.isObject(objWith) ){
                return false;
            }
            var len1 = Object.keys(objWith).length;
            var len2 = Object.keys(objToCompare).length;
            if(len1 !== len2 ){
                return false;
            } 
            for (var key in objToCompare)
                if (key && objToCompare[key] !== objWith[key])
                    return false;
        }
        return true;
    };
    
    //if value in array it returns it's index.
    //if not -1
    //both value and array items can be objects
    JLP.inArray = function (value, array){
        if(typeof value === 'object'){
            array = JLP.isArray(array)? array: [];
            for(var i = 0; i < array.length; i++){
                if(equal(value,array[i])){
                    return i;
                }
            }
            return -1;
        }
        return array.indexOf(value);
    };
    
    JLP.bind = function (fn, scope){
        return function() {
            return fn.apply(scope, arguments);
        };
    };
 
    JLP.prototype.children = function(){
        var ar = [];
        ar = this.get(0).children;
        this.length = ar.length;
        for(var i = 0; i < this.length; i++)
            this.elems[i] = ar[i] ;
        this.elems = this.elems.slice(0,this.length);
        return this;
    };
    
    JLP.prototype.first = function(){
        return this.eq(0);
    };
    
    JLP.prototype.parent = function(){
        var ar = [];
        for(var i = 0; i < this.length; i++){
            var par =  this.get(i).parentNode;
            if(JLP.inArray(par, ar) ===-1 ){
                ar.push(par);
            }
        }
        this.length = ar.length;
        for(var i = 0; i < ar.length; i++)
            this.elems[i] = ar[i];
        
        this.elems = this.elems.slice(0,this.length);
        return this;
    };
    
    JLP.prototype.append = function(obj){
        var clone = [];
        var len2 = obj.length;
        var th = this;
        
        th.each(function(){
            for(var i = 0; i < len2; i++){
                clone[i] = obj.get(i).cloneNode(true);
                this.appendChild(clone[i]);
                var par = obj.eq(i).parent();
                if (obj.get(i).parentNode) 
                par.get(0).removeChild(obj.get(i)); 
            }
        });
        
        return this;
    };
        
    
    window.JLP = window.$= JLP;
    return JLP;
})();
