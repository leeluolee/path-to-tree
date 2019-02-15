
const Tree = require('./tree');

function ptt(routeConfig, option ) {
    return new Tree(routeConfig, option)
}

ptt.Tree = Tree;

module.exports = ptt;