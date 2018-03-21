function extend(o1, o2, override) {
    for (var i in o2)
        if (override || o1[i] === undefined) {
            o1[i] = o2[i];
        }
    return o1;
};


// 避免内存泄漏
function cachedHashMap( option ) {
    option = option || {};

    var keys = [],
        limit = option.limit || 1000,
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
            if (key === undefined) return cache;
            return cache[key];
        },
        limit: limit,
        len: function() {
            return keys.length;
        }
    };
}

function escapeRegexp( str ) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

/**
 * find Sub Capture to fix regexp.exec capture position
 * @param  {String} regStr regexp string
 * @return {Number}        subcapture number
 */

function findSubCapture(regStr) {


    let left = 0,
        right = 0,
        len = regStr.length,
        ignored = regStr.match(ignoredRef); // ignored uncapture

    if (ignored) {

        ignored = ignored.length
    } else {

        ignored = 0;
    }

    for (; len--;) {

        let letter = regStr.charAt(len);
        if (len === 0 || regStr.charAt(len - 1) !== "\\") {

            if (letter === "(") left++;
            if (letter === ")") right++;
        }
    }
    if (left !== right) throw "RegExp: " + regStr + "'s bracket is not marched";
    else return left - ignored;

}



module.exports = {
    extend,
    cachedHashMap,
    escapeRegexp
}