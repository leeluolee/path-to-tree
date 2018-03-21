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
        const isLast = index === context.length-1;

        // if absolute match or  the route has end === false option
        if( isLast ){
            return found;
        }else{
            let childFound = find(found, index+1, context);
            if(childFound) return childFound
            else {
                if(route.end === false) return found
            }
        }
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

            let matches = pattern.matches;

            let keys = Object.keys(matches);

            for( let j = 0, klen = keys.length; j < klen; j++ ){

                let match = matches[ keys[j] ];
                let matchFound

                if( isLast || (matchFound  = find( match.route, index + 1, context ) ) ) {


                    buildParam( ret, pattern.slots , match.names, context.param ) 

                    return isLast? match.route: matchFound;
                }
            }



        }

    }

}


function buildParam( execRet, slots, names, param){

    for( let i = 0, len = names.length ; i < len; i++ ){
        // @TODO warning same param
        param[names[i]] = execRet[slots[i]]
    }

}


module.exports = { find }


