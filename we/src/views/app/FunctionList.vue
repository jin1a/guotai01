<template>
  <div class="function-van-cellst-container">
    <van-cell-group class="fs14 p20">
      <van-cell class="fs18 mb10">基础功能清单：</van-cell>
      <van-cell>
        1、api、router、store等模块划分
      </van-cell>
      <van-cell>
        2、mock方案：rap2，登录、我的信息接口mock
      </van-cell>
      <van-cell>
        3、权限控制、路由拦截器、http拦截器
      </van-cell>
      <van-cell>
        4、表单验证
      </van-cell>
      <van-cell>
        5、常用sass
      </van-cell>
      <van-cell>
        6、路由页面切换动画
      </van-cell>
      <van-cell>
        7、多环境打包配置
      </van-cell>
      <van-cell>
        8、esvan-cellnt + prettier
      </van-cell>
      <van-cell>9、移动端适配方案，vw</van-cell>
      <van-cell>10、主题定制</van-cell>
      <van-cell>
        11、过滤器注册、移动端300ms延时、调试工具eruda
      </van-cell>
    </van-cell-group>
    <van-tabbar v-model="active">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="setting-o" @click="$router.push({ path: '/contributionDetails' })">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { Tabbar, TabbarItem, Cell, CellGroup } from 'vant'

export default {
  name: 'functionvan-cellst',
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup
  },
  data() {
    return {
      active: 0
    }
  }
}
</script>
<style lang="scss" scoped></style>
