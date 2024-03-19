// 拆分 bundles，同时提升构建速度
// https://doc.webpack-china.org/plugins/dll-plugin/
// https://segmentfault.com/a/1190000010045690
// http://engineering.invisionapp.com/post/optimizing-webpack/
const path = require('path')
const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
//读取package.json里的依赖，normalize.css除外，打包会报错
const package = require('../package.json')

module.exports = {
  entry: {
    vendor: Object.keys(package.dependencies).filter((item) => {
      return item.indexOf('normalize') < 0 && item == 'vue'
    })
  },
  output: {
    path: path.join(__dirname, '../static'),
    filename: 'dll.[name]_[hash:6].js',
    library: '[name]_[hash:6]'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, '../', '[name]-manifest.json'),
      name: '[name]_[hash:6]'
    }),
    // 把带hash的dll插入到html中
    new AssetsPlugin({
      filename: 'bundle-config.json',
      path: './'
    })
  ]
}