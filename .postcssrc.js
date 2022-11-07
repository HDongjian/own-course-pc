/*
 * @Author: HaoDongjian
 * @Date: 2022-05-23 10:38:07
 * @LastEditors: HaoDongjian
 * @LastEditTime: 2022-11-07 11:36:20
 * @Description: 
 */

module.exports = {
  plugins: {
    autoprefixer: {},
    "@njleonzhang/postcss-px-to-rem": {
      unitToConvert: 'px', // 要转换的单位，默认情况下，它是px。
      widthOfDesignLayout: 1920, // (Number) 设计布局的宽度。
      unitPrecision: 8, // (Number) 允许 REM 单位增长到的十进制数。
      selectorBlackList: ['.ignore', '.hairlines'], // (Array) 要忽略并保留为 px 的选择器。
      minPixelValue: 0.01, // (Number) 设置要替换的最小像素值。
      mediaQuery: false // (Boolean) 允许在媒体查询中转换 px。
    }
  }
}
