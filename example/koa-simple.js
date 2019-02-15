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
