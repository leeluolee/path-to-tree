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
} = require('./util');
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