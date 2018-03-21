
const { extend, cachedHashMap, escapeRegexp } = require('./util');
const Tokenizer = require('./tokenizer');
const rutil = require('./route');
const finder = require('./finder');
const rClean = /^\/+|\/+$/;
const rStatic = /[:(]/


function Matcher( option ){

    option = option || {};

    this.dynamicRoute = rutil.create();
    this.staticRoute = {}
    this.delimiter = option.delimiter || '/'

}


const mo = Matcher.prototype;


mo.add = function( path, option ){

    const delimiter = this.delimiter;
    const end =  option.end;
    const strict = option.strict;

    const {dynamicRoute, staticRoute} = this;
    //@TODO when option.end === true or option.strict === true ?? 
    let isStatic = !(rStatic.test(path))  ; 

    if(isStatic){
        staticRoute[ path ] = { marker: option.marker }
        return ;
    }

    let tokenStream = new Tokenizer( path , option ).tokenize();

    // 当前rutil引用
    let curRoute = this.dynamicRoute, 
        context = {
            unnamedCapture: 0
        };

    for(let i = 0, len = tokenStream.length; i < len ; i++){

        let tokenObj = tokenStream[i]
        let tokens = tokenObj.tokens;

        if( !tokenObj.pattern ){

            curRoute = rutil.addRoute( curRoute, tokens.join() );

        }else { 

            curRoute = rutil.addPattern( curRoute, tokenObj, context );
        }
    }
    curRoute.marker = option.marker;
    curRoute.end = end === false? false: true;
    curRoute.strict = strict === false? false: true;
    return curRoute;
} 


mo.find = function(path, option){

    let param = {}
    let route =  this._find(path, param, option);
    if(route){
        return {
            marker: route.marker,
            param 
        }
    }else{
        return null
    }
}

mo._find = function( path, param ,option ){

    option = option || {}
    if(typeof path !== 'string' || !path) throw Error('path invalid');

    const { dynamicRoute, staticRoute, delimiter } = this;

    path = path.trim();

    if( staticRoute[path] ) return staticRoute[path]

    const lastDelimiter = path.charAt(path.length-1) === delimiter 
    const pathes = path.replace( rClean, '').split(delimiter);

    return finder.find(dynamicRoute, 0, {
        length: pathes.length,
        pathes,
        param: param,
        lastDelimiter
    })

}


module.exports = Matcher

var m = new Matcher();

m.add('/(\\d+|(?:\\w+))/slot/:id/:name(\\d+)/(hello|name|([abc]+)k)-:sid', {
    marker: 1
})

m.add('/api/blog', {
    marker: 2 
})

m.add('/api/blog/:id', {
    marker: 3,
    end: false
})

m.add('/api/blog/:id/tags', {
    marker: 4
})

m.add('/api/blog/(edit|detail)-tags', {
    marker: 5
})

m.add('/api/tags/:id', {
    marker: 6
})




console.log( 
    m.find('/api/blog/1/page')
)




