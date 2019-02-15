const Benchmark = require('benchmark');
const ptt = require('../');
const ptr = require('path-to-regexp');
const assert = require('assert');


var suite = new Benchmark.Suite;

let _routes = [
    "/user",
    "/user/comments",
    "/user/lookup/username/:username",
    "/user/lookup/email/:address",
    "/event/:id",
    "/event/:id/comments",
    "/map/:location/events",
    "/status",
    "/very/deeply/nested/route/hello/there",
    "/blog/(hello|world)"
]

let routes = [];

for(var i = 0; i<100; i++){ //prefix
    routes = routes.concat( _routes.map(r=>'/' + i + r) )
}

routes = routes.concat( _routes );

for(var i = 0; i<100; i++){ //postfix
    routes = routes.concat(_routes.map(r=> r + '/' + i))
}

const cases = [
    ["/user", 1000],
    ["/user/comments", 1001],
    ["/user/lookup/username/john", 1002, { "username": "john" }],
    ["/event/abcd1234/comments", 1005, { "id": "abcd1234" }],
    ["/very/deeply/nested/route/hello/there", 1008 ],
    ["/static/index.html", false],
    ["/blog/hell", false],
    ["/blog/hello", 1009, {"0": 'hello'}]
]


const pttRun = (function(){

    const tree = ptt();

    routes.map( (route, index)=> tree.add(route, index))

    return function (url){
        const test = tree.find(url);
        if(test){
            return [test.marker, test.param]
        }else{
            return [false]
        }
    }

})();

const ptrRun = function(){

    const matches = routes.map((route)=>{
        const keys = [];

        const regexp = ptr(route, keys);
        return {
            regexp,
            keys
        }

    })

    return function ( url ) {
        for(let i = 0, len = matches.length; i< len;i++) {

            let match = matches[i];
            let ret =  match.regexp.exec( url );

            if(ret){
                let keys = match.keys,param = {};
                for(let j=0; j< keys.length; j++ ){
                    param[keys[j].name] = ret[j+1];
                }
                return [i, param ]
            }
                

        }   
        return [false]
    }

}()



const run = function(runner){

    for(let i=0, len = cases.length; i<len ;i++){

        let [url, index, param] = cases[i];

        for(var j =0; j< 1000; j++){
            runner(url);
        }
        
        let [idx, p] =  runner(url);

        if(index !== false){
            assert.equal( index, idx )

            if( param !== undefined ) {
                assert.deepEqual(param, p)
            }
        }

    }
}



// add tests
suite.add('path-to-tree', function () {
       run(pttRun) 
    })
    .add('path-to-regexp', function () {
       run(ptrRun, 1000) 
    })
    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async
    .run({
        'async': true
    });