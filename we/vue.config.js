const autoprefixer = require('autoprefixer')
const pxtoviewport = require('postcss-px-to-viewport')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: '/saleH5',
  lintOnSave: false, //是否开启代码检查
  outputDir: 'dist', //打包输出目录
  productionSourceMap: false,
  devServer: {
    https: false
  },
  css: {
    sourceMap: true, // 查看css属于哪个css文件
    loaderOptions: {
      postcss: {
        plugins: [
          autoprefixer(),
          pxtoviewport({
            viewportWidth: 375,
            // 该项仅在使用 Circle 组件时需要
            // 原因参见 https://github.com/youzan/vant/issues/1948
            selectorBlackList: ['van-circle__layer']
          })
        ]
      }
    }
  },
  chainWebpack: (config) => {
    // 移除 prefetch 插件
    config.resolve.alias.set('@utils', resolve('./src/assets/js/utils'))

    // config.plugins.delete('prefetch')
    /* 配置svg图标自动加载 begin */
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
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
    //设置路径别名
  },
  configureWebpack: (config) => {
    ;(config.devtool = 'source-map'), // 调试js
      (config.performance = {
        hints: 'error',
        //入口起点的最大体积 700kb
        maxEntrypointSize: 7168000,
        //生成文件的最大体积 700kb
        maxAssetSize: 7168000,
        //只给出 js 文件的性能提示
        assetFilter: function (assetFilename) {
          return assetFilename.endsWith('.js')
        }
      })
  }
}
