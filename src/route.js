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
// save the regexp to 
const regExpCache = cachedHashMap(100);


function create() {
    return {
        patterns: [],
        staticMap: {},
        option: {}
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
            ret += '(' + token.value + ')'
        }
    }
    let path = '^' + ret + '$';

    context.unnamedCapture += anonyCapture;

    const reg = regExpCache.get( path ) || regExpCache.set( path, new RegExp(path) );

    const patterns = route.patterns;

    let pattern = findPattern( patterns, path );

    if( pattern ) return addExisitPattern( pattern, raw, names )

    pattern = {
        key: path,
        regexp: reg,
        slots,
        matches: {}
    }

    patterns.push( pattern );

    return addExisitPattern( pattern, raw, names)
}

function addExisitPattern(pattern, raw, names){

    let matches = pattern.matches;
    let match = matches[raw];

    if( match ) return match.route;

    match = matches[raw] = {
        names,
        route: create()
    }
    return match.route;

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