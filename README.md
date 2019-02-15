
[![Build Status](https://travis-ci.org/leeluolee/path-to-tree.svg?branch=master)](https://travis-ci.org/leeluolee/path-to-tree)

A tiny foundation for building  fast router via  __Radix Tree strategy__ , high performance alternative for famous [__path-to-regexp__](https://github.com/pillarjs/path-to-regexp)。

- [install](#install)
- [usage](#usage)
- [API](#api)
  - [new Tree( routeMap )](#new-tree-routemap)
  - [`tree.add(path, definition)`](#treeaddpath-definition)
  - [`tree.find(url, definition)`](#treefindurl-definition)
- [Live Example](#live-example)
  - [Simple Koa Router](#simple-koa-router)





## install

```shell
npm i path-to-tree
```

## usage


```js

const Tree = require('path-to-tree');

const tree = new Tree;

tree.add('/user/:id');

const { param } = tree.find('/user/1')

/**
 * {
 *  param: {
 *     id: "1" 
 * } 
 * }
 * 
 * /

```


## API



### new Tree( routeMap )

create tree finder instance

__param__

- routeCfg: routes to add


```js

const tree = new Tree({
    '/blog/:id': { callback }
})

```



### `tree.add(path, definition)`

add 



### `tree.find(url, definition)`


## Live Example


### Simple Koa Router


```js

const Tree = require('path-to-tree')

function router(cfg){

    const routeConfig = {}

    for(var i in cfg){
        routeConfig[i] = {
            fn: cfg[i]
        }
    }

    const tree = new Tree(routeConfig);

    return async function(ctx, next){
        ctx.param = {}
        const match = tree.find( ctx.url ) 
        if(match){
            await match.fn(ctx, next)
        }else{
            await next();
        }
    }
}

```


at koa application

```js

const Koa = require('koa');
const app = Koa();


app.use(router({
    '/blog/:id': (ctx, next)=>{
        ctx.body = ctx.param.
    },
    '/user/:id(\\d+)': (ctx, next)=>{

    }
}))


```
