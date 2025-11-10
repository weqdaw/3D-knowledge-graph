const path = require('path');


module.exports = {
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      fallback: {
        "fs": false,
        "path": false,
        
      }
    }
  },
  devServer: {
    port: 7800
  }
}
