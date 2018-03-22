
const { extend, cachedHashMap } = require('./util');
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

    option = option || {}
    const delimiter = this.delimiter;
    const end =  option.end;
    const strict = option.strict;

    const {dynamicRoute, staticRoute} = this;
    //@TODO when option.end === true or option.strict === true ?? 

    let isStatic = end !== false && !(rStatic.test(path)) ; 

    if(isStatic){
        if(staticRoute[path]) throw error('path ' + path + ' is already registed')
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
    if(curRoute.touched) throw error('path ' + path + ' is already registed')
    curRoute.touched = true;
    curRoute.marker = option.marker;
    curRoute.end = end === false? false: true;
    curRoute.strict = strict === false? false: true;
    return curRoute;
} 


mo.find = function(path, option){

    let param = {}
    let route =  this._find(path, param, option);

    if(route ){
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
    if(typeof path !== 'string' || !path) throw error('path invalid');

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

