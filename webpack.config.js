var path = require('path');
var webpack = require('webpack');

var config =  {

    entry: "./lib/index.js",

    output: {
        filename: "ptt.js",
        library: "ptt",
        path: path.join(__dirname, 'dist'),
        libraryTarget: "umd"
    },
    mode: 'production',
    
    externals: { "ptt": "ptt" },

    devtool:'source-map'
};





module.exports = config;