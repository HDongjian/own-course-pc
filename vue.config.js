/*
 * @Author: HaoDongjian
 * @Date: 2022-04-21 15:26:30
 * @LastEditors: HaoDongjian
 * @LastEditTime: 2022-11-07 11:48:02
 * @Description:
 */
const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)
module.exports = {
  publicPath: './',
  outputDir: 'dist',
  devServer: {
    port: 4006,
    proxy: 'https://course.hdongyu.com',
    // proxy: 'http://47.104.69.49/api',
    // proxy: 'http://localhost:3006',
    open: false
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('@njleonzhang/postcss-px-to-rem')({
            unitToConvert: 'px', // 要转换的单位，默认情况下，它是px。
            widthOfDesignLayout: 1920, // (Number) 设计布局的宽度。
            unitPrecision: 8, // (Number) 允许 REM 单位增长到的十进制数。
            selectorBlackList: ['.ignore', '.hairlines'], // (Array) 要忽略并保留为 px 的选择器。
            minPixelValue: 0.01, // (Number) 设置要替换的最小像素值。
            mediaQuery: false // (Boolean) 允许在媒体查询中转换 px。
          })
        ]
      }
    }
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
  },
  configureWebpack: configParams => { }
}
