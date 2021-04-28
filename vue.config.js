const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)
module.exports = {
  publicPath: './',
  outputDir: 'ownpc',
  devServer: {
    port: 4006,
    // proxy: 'http://course.hdongyu.com',
    // proxy: 'http://47.104.69.49/api',
    proxy: 'http://localhost:3006',
    open: false
  },
  chainWebpack: (config) => {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
}
