var path = require('path');
var webpack = require('webpack');

var config =  {

    output: {
        filename: "nerouter.js",
        library: "nerouter",
        path: path.join(__dirname, 'dist'),
        libraryTarget: "umd"
    },
    mode: 'development',
    
    externals: {
        // require("jquery") 是引用自外部模块的
        // 对应全局变量 jQuery
        "nerouter": "nerouter"
    },

    devtool:'source-map'
};





module.exports = config;