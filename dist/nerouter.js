(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["nerouter"] = factory();
	else
		root["nerouter"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/finder.js":
/*!***********************!*\
  !*** ./src/finder.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

// find the route via path


/**
 * find 是 context param 
 * @param  {Object} route   [description]
 * @param  {String} index   当前下标
 * @param  {Object} context 递归过程中，有一些通用上下文需要传递
 *                  - pathes: 总路径
 *                  - index: 当前路径下标
 *                  - param: 已经设置的参数对象
 * @return {Object}         [description]
 */
function find ( route, index, context ){

    index = index || 0;


    let found = findStatic( route, index, context );

    if( found ) return found;
    

    return findDynamic( route, index, context );
    
}


/**
 * [findStatic 描述]
 */
function findStatic( route, index, context ){

    const path = context.pathes[index];

    const staticMap = route.staticMap;

    const found = staticMap[ path ];

    if( found ) {
        const isLast = index === context.length - 1;

        // if absolute match or  the route has end === false option
        if( isLast  ){ // need registed
            return found.touched? found: null;
        }

        let childFound = find(found, index+1, context);
        if( childFound ) return childFound

        // end means touched
        if(found.end === false ) return found
        
    }
}


/**
 * [findDynamic 描述]
 */
function findDynamic( route, index, context ){

    const path = context.pathes[index];
    const patterns = route.patterns;
    const isLast = context.length-1 === index;

    if( !patterns.length ) return null;

    for( let i = 0, len = patterns.length; i < len; i++ ){

        let pattern = patterns[i];
        if(!pattern) continue;

        let regexp = pattern.regexp;
        // use test for better performance
        let ret = regexp.exec(path); 


        if(ret){
            // 后面有没有找到

            let nextRoute = pattern.route;

            if( isLast ){
                if(!nextRoute.touched) return ;
                buildParam( ret, pattern.slots , pattern.names, context.param ) 
                
                return  nextRoute;
            }

            let nextFound = find( nextRoute, index + 1, context );


            if(nextFound || nextRoute.end === false ) {
                buildParam( ret, pattern.slots , pattern.names, context.param ) 
                return nextFound? nextFound : nextRoute;
            }


        }

    }

}


function buildParam( execRet, slots, names, param){

    for( let i = 0, len = names.length ; i < len; i++ ){
        // @TODO warning same param
        const name =  names[i];
        param[name] = execRet[slots[i]]
    }

}


module.exports = { find }




/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


module.exports = {
    Matcher: __webpack_require__(/*! ./matcher.js */ "./src/matcher.js")
}

/***/ }),

/***/ "./src/matcher.js":
/*!************************!*\
  !*** ./src/matcher.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { extend, cachedHashMap } = __webpack_require__(/*! ./util */ "./src/util.js");
const Tokenizer = __webpack_require__(/*! ./tokenizer */ "./src/tokenizer.js");
const rutil = __webpack_require__(/*! ./route */ "./src/route.js");
const finder = __webpack_require__(/*! ./finder */ "./src/finder.js");
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



/***/ }),

/***/ "./src/route.js":
/*!**********************!*\
  !*** ./src/route.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**

{
    patterns: [ 
        {
            key: regStr,
            regexp: /regexp/, // 以patter作为分解. 不重复探测一样的pattern
            slots: [0, 2], param slot
            matches: {
                ':id': {
                    names: ['id'],
                    route: Route
                }    
            }
        }
    ],
    marker: {},
    last: false,
    option: {
        end: true,
        strict: true,
        delimiter: true,
        // sensitive: true  暂时不支持，否则需要保存两份
    },
    route: {
        blog: Route
    }
}

 * 
 */


const {
    cachedHashMap,
    escapeRegexp
} = __webpack_require__(/*! ./util */ "./src/util.js");
// save the regexp to . to avoid memory leak
const regExpCache = cachedHashMap(1000);


function create() {
    return {
        patterns: [],
        staticMap: {}
    }
}


function addPattern(route, tokenObj, context) {


    let captureIndex = 1,
        tokens = tokenObj.tokens,
        unnamedCapture = context.unnamedCapture || 0,
        ret = '',
        names = [], slots=[],
        anonyCapture = 0,
        raw = tokenObj.raw;

    for (let j = 0, len = tokens.length; j < len; j++) {

        let token = tokens[j];

        if (typeof token === 'string') {
            ret += escapeRegexp(token);
        } else { // @TODO  other type

            slots.push(captureIndex);
            names.push(token.name? token.name:  unnamedCapture + anonyCapture++)

            captureIndex += token.retain;
            ret += '(' + token.value + ')' + (token.optional? '?':'')
        }
    }
    let path = '^' + ret + '$';

    context.unnamedCapture += anonyCapture;

    const reg = regExpCache.get( path ) || regExpCache.set( path, new RegExp(path) );

    const patterns = route.patterns;

    let pattern = findPattern( patterns, path );

    if( pattern ) {
        if( !sameArray(pattern.names, names) ) {
            throw Error('named Capture conflict ' + raw + ' -> ' + pattern.raw )
        }
        return pattern.route;
    }

    pattern = {
        key: path,
        regexp: reg,
        raw,
        slots,
        names,
        route: create()
    }

    patterns.push( pattern );

    return pattern.route
}

function sameArray(arr1, arr2){
    if(arr2.length !== arr1.length) return false;

    for(let i=0, len = arr1.length; i < len; i++){
        if(arr1[i] !== arr2[i]) return false;
    }
    return true
}




/**
 * 增加静态Route
 */
function addRoute(route, name) {

    return route.staticMap[name] ||  (route.staticMap[name] = create())

}


function findPattern(patterns, path) {

    for( let i = 0,len = patterns.length ; i < len; i++ ) {

        if(patterns[i].key === path) return patterns[i]

    }
}


module.exports = {
    create,
    addRoute,
    addPattern
}

/***/ }),

/***/ "./src/tokenizer.js":
/*!**************************!*\
  !*** ./src/tokenizer.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// build the route via pattern

const { extend, error  } = __webpack_require__(/*! ./util */ "./src/util.js");


// path 

const DEFAULT_CAPTURE_PATTERN = '\\w+'
const ignoredRef = /\((\?\!|\?\:|\?\=)/g;

function Tokenizer(input, option) {

    this.index = 0;
    this.input = input;
    this.length = input.length;
    this.delimiter = option.delimiter || '/';
    this.option = option;
    this.tokens = [];
    this.paramMap= {};
}

const to = Tokenizer.prototype;


to.tokenize = function() {
    const {length, delimiter, input} = this;
    const tokenStream = [{pattern: false, tokens: []}];

    let tokenObj = tokenStream[0];

    if(input[0] === delimiter) this.index = 1;
    let preSlashIndex = this.index;

    // index Or 
    while ( (char = input[this.index]) && this.index < length ) {


        switch ( char ) {
            case ':':
                tokenObj.tokens.push( this.readNamedCapture() );
                tokenObj.pattern = true;
                break;
            case '(':
                tokenObj.tokens.push( this.readCapture() );
                tokenObj.pattern = true;
                break;
            case delimiter:
                if( tokenObj.pattern ){
                    tokenObj.raw = input.substring( preSlashIndex, this.index )
                }
                this.index++;
                tokenObj = { pattern:false, tokens: [] } ;
                tokenStream.push(tokenObj);
                preSlashIndex = this.index;

                break;
            default:
                tokenObj.tokens.push(this.readAnyOther());

        }
    }
    if( tokenObj.pattern ){
        tokenObj.raw = input.substring( preSlashIndex, this.index )
    }
    return tokenStream;
}



to.char = function(offset) {
    return this.input[this.index + (offset || 0)];
}

to.readNamedCapture = function() {

    this.index++;
    const word = this.readWord();

    let capture

    if( this.paramMap[word.value] ) throw error('Conflict param: ' + word.value, 'ParseError'); 

    this.paramMap[word.value] = 1;

    if( this.char() === '(' ) {

        capture = this.readCapture();

    }else{

        capture = {
            value: DEFAULT_CAPTURE_PATTERN,
            retain: 1
        }
        if(this.eat('?')){
            capture.optional = true;
        }
    }

    capture.name = word.value;
    return capture
}

to.readCapture = function(){

    let subCaptrueOpen = subCaptrue = 0;
    this.match('(');
    let start = this.index;
    let char, input = this.input;

    while( char = input[ start ] ){

        if( input[ start - 1 ]  !== '\\' ){

            if( char === '(' ){

                subCaptrueOpen++ ;

            }else if( char === ')' ){

                if( subCaptrueOpen > 0 ){

                    subCaptrueOpen--;
                    subCaptrue++;

                }else{
                    break;
                }

            }
        }
        start++;

    }

    let value = this.input.substring( this.index, start );

    let ignored = 0
    if(subCaptrue){
        let ignoredRet = value.match( ignoredRef );

        if(ignoredRet) ignored = ignoredRet.length;
    }

    let token = {
        type: 'pattern',
        retain: subCaptrue - ignored + 1,
        value
    }


    this.index = start;

    this.match(')');

    if(this.eat('?')){
        token.optional = true
    }

    return token;


}

to.match = function( char){

   if( !this.eat(char) ) throw error('expect '+ char + ' got ' + this.char(), 'ParseError');

}

to.eat = function(char){
    if(this.char() === char){
        this.index++;
        return char
    }
    return false;
}


to.readWord = function(){

    let end = this.index + 1;
    let input = this.input;

    while( isAlpha( input[end] ) ){

        end++;

    }

    if(end > this.index){
        let token = {
            type:'word',
            value: this.input.substring(this.index, end)
        }
        this.index = end;

        return token;
    }else{

        throw Error('readAlpha failed')
    }

}

to.readAnyOther = function() {
    const input = this.input;
    let end = this.index;


    let char = input[end];
    while (isAnyOther(char) && char !== this.delimiter) {

        if(char === '?' || char === '+' || char === '*'){
            throw Error('unsupport token ' + char)
        }

        char = input[++end]
    }

    if ( end > this.index) {

        let token = this.input.substring(this.index, end);
        this.index = end;
        return token;

    } else {
        throw Error('readAnyOther failed')
    }

}




function isAlpha( c ){
    return  (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') ||
            c === '_';
}


function isAnyOther(char) {
    return char && char !== '(' && char !== ':'
}



module.exports = Tokenizer;










/***/ }),

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

// function extend(o1, o2, override) {
//     for (var i in o2)
//         if (override || o1[i] === undefined) {
//             o1[i] = o2[i];
//         }
//     return o1;
// };


// 避免内存泄漏
function cachedHashMap( option ) {
    option = option || {};

    var keys = [],
        limit = option.limit || 100,
        cache = {};

    return {
        set: function(key, value) {
            if (keys.length > this.limit) {
                cache[keys.shift()] = undefined;
            }
            //
            if (cache[key] === undefined) {
                keys.push(key);
            }
            cache[key] = value;
            return value;
        },
        get: function(key) {
            return cache[key];
        },
        limit: limit
    };
}

function escapeRegexp( str ) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}


function error( message, name ){
    let errorObj = {message}
    if(name) errorObj.name = name
    return errorObj;
}



module.exports = {
    // extend,
    cachedHashMap,
    escapeRegexp,
    error
}

/***/ })

/******/ });
});
//# sourceMappingURL=nerouter.js.map