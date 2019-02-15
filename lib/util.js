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