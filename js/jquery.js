window.onload=function(){
    
    var a = JLP("#content");
    console.log(a);
    
    var b = JLP(".col");
    console.log(b);
    
    var c = JLP("p");
    console.log(c);
    
    var d = JLP("div [data-attr =* budet]");
    console.log(d);
    
    var e = JLP(".col [data-attr =* budet]");
    console.log(e);
    
    var f = JLP("#content, .col , p , li, ul");
    console.log(f);
    
    var g = JLP("option [selected =* selected]");
    console.log(g.length);
    
    var h = JLP("input [checked =* checked]");
    console.log(h.length);
    
    //dempnstrates the eq() method + chain of anim.func
    JLP(".col").eq(2).hide(4000).show(4000).fadeOut(4200).fadeIn(4300).slideUp(4400).slideDown(4100);
  
    
    //Notice that if two different selectors selects the same JLP object, the anim.funcs work in turn
    JLP('p').hide(1000);
    JLP('.txt').slideDown(1000);
      
   
    //method get()
    console.log(JLP("img").get(0));
    
    //method text()
    console.log(JLP("p").text());
    JLP("p").text("Change the text of all p tags");
    
    //method html()
    console.log(JLP('li').html());
    JLP("li").eq(1).html("Change the content of the 2nd li...");
    
    
    //method each
    JLP('p').each(function(i,el){
        console.log(i);
        console.log(this.innerHTML);
    });
    

    //methods on + setStyle + animate
    JLP('li').on('click', function(){
        JLP(this).setStyle({
            'color': 'green'
        });
        JLP("li").animate({
            width:"50px",
            'border-radius':'30px',
            "font-size" : "50px",
            opacity: 0.8
        },5000)
        .animate({
            width:"100px",
            "font-size" : "15px",
            opacity: 0.3
        },5000);
    });
    
    // addClass/removeClass
    JLP(".col [data-attr =* budet]").on('mouseover',function(){
        JLP(this).addClass('highlight');
    });
    JLP(".col [data-attr =* budet]").on('mouseout',function(){
        JLP(this).removeClass('highlight');
    });
    
    //merge
    var obj1 = {prop:1, prop2:3};
    var obj2 = {prop2:2};
    JLP.merge(obj1, obj2);
    console.log(obj1);//{prop: 1, prop2: 2}
    var obj3 = {prop2:5};
    JLP.merge(obj1,obj3,false);
    console.log(obj1);//{prop: 1, prop2: 2}
    
    //inArray
    var i = JLP.inArray(0,[1,2,"safa",false,0]);
    console.log(i); // 4
    var i = JLP.inArray(true,[1,2,"safa",false,0]);
    console.log(i); // -1
    var i = JLP.inArray({prop1: 1, prop2: 2},[{},5,{prop1: 1, prop2: 2, prop3: 3 },"abc", {prop1: 1, prop2: 2}]);
    console.log(i); // 4
 
    
    console.log(JLP('li').children());
    JLP('li').append(JLP('.col').eq(2));
	
	
	alert("this is just a js file.... to test ");
	
	
	
	
};
