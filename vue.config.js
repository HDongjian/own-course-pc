module.exports = {
  publicPath: './',
  outputDir: 'ownpc',
  devServer: {
    port: 4006,
    proxy: 'http://course.hdongyu.com/api',
    // proxy: 'http://47.104.69.49/api',
    // proxy: 'http://localhost:3006/api',
    open: false
  }
}
