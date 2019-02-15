[![Build Status](https://travis-ci.org/leeluolee/path-to-tree.svg?branch=master)](https://travis-ci.org/leeluolee/path-to-tree)

A tiny(3kb) foundation for building  fast router via  __Radix Tree strategy__ , high-performance alternative for famous [__path-to-regexp__](https://github.com/pillarjs/path-to-regexp)。

You can use it both in browser or Node.js.

- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [`ptt( routeMap )`](#ptt-routemap)
  - [`tree.add( route, marker [, option ])`](#treeadd-route-marker--option)
  - [`tree.find( path )`](#treefind-path)
- [support param](#support-param)
- [Example](#example)
  - [Simple Koa Router](#simple-koa-router)
- [Benchmark](#benchmark)




## Install

```shell
npm i path-to-tree
```

## Usage


```js

const ptt = require('path-to-tree');

const tree = ptt()

tree.add('/user/:id', 2);

const { param } = tree.find('/user/1')

/**
 * ==> {
 *  param: {
 *     id: "1" 
 * } ,
 * marker: 2
 * }
 * 
 * /

```


## API



### `ptt( routeMap )`

create tree instance

__param__

- routeMap: route map to add


```js

const tree = ptt({
    '/blog/:id': 'blog',
    '/user/:id': 'user'
})

```

as same as

```js

const tree = ptt()

tree.add( '/blog/:id', 'blog')
tree.add( '/user/:id', 'user')

```


### `tree.add( route, marker [, option ])`

add a route pattern

- route: route string like `/api/blog/:id`
- marker: route marker which will return by [find](#find)
- option: route config
    - strict: when false ,  trailing delimiter is optional. (default: true)
    - end: when false， only match the prefix of the URL  (default: true)


```js

const ptt = require('path-to-tree');

const tree = ptt();

tree.add('/blog/:id', function(param)=>{
    console.log(param)
})

```



<a name='find'></a>
### `tree.find( path )`

- return : a object container marker and param

```js

let ret = tree.find('/blog/1');

ret.marker(ret.param) // => {id: "1"}



// marker === 
```


## support param


- named param: `'/api/blog/:id`
- anonymous param: `'/api/(hello|world)'`
- optional param: `/api/name-:id?`、 `/api/name-(id|co)?`
- complex param: `/blog/dada-((?:hello|nice)?-world)`




## Example


### Simple Koa Router


```js

const ptt = require('../') // === require('path-to-tree')

function router(cfg) {

    const tree = ptt(cfg);

    return async function (ctx, next) {
        const match = tree.find(ctx.path)
        if (match) {
            ctx.param = match.param;
            await match.marker(ctx, next)
        } else {
            await next();
        }
    }
}


const Koa = require('koa');
const app = new Koa();


app.use(
    router({
        '/blog/:id': (ctx, next) => {
            ctx.body ='blog ' + ctx.param.id
        },
        '/user/:id(\\d+)': (ctx, next) => {

            ctx.body ='user ' + ctx.param.id
        }
    })
)

app.listen(8002, ()=>{
    console.log('server start at 8002')
})
```

## Benchmark

router based on path-to-regexp , described as  O(n) Time Complexity ( n means route's length )

By contrast, router based on path-to-tree described as O(1) Time Complexity .(consider the deepth of path as constant)

In my computer (MacBook Pro 15: 2.2 GHz Intel Core i7、16 GB 1600 MHz DDR3) , the result of [the benchmark ](https://github.com/leeluolee/path-to-tree/benchmark) show as below.

> _size of routes is 3000, 200x fast_

```
path-to-tree x 215 ops/sec ±0.45% (77 runs sampled)
path-to-regexp x 1.04 ops/sec ±0.39% (7 runs sampled)
Fastest is path-to-tree
```




