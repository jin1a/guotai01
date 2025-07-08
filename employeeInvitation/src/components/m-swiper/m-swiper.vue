<template>
  <div class="m-swiper-container swiper-container" ref="swiper">
    <div class="swiper-wrapper">
      <slot>
        <div class="swiper-slide">
          <van-empty />
        </div>
        <div class="swiper-slide"><img src="https://img01.yzcdn.cn/vant/cat.jpeg" alt="" /></div>
        <div class="swiper-slide"><img src="https://img01.yzcdn.cn/vant/cat.jpeg" alt="" /></div>
      </slot>
    </div>
    <div class="swiper-pagination" v-if="showPagination"></div>
    <div class="swiper-button-next" v-if="showNextBtb"></div>
    <div class="swiper-button-prev" v-if="showNextBtb"></div>
  </div>
</template>
<script>
import Swiper from 'swiper'
import 'swiper/css/swiper.min.css'
import { Empty } from 'vant'

export default {
  name: 'm-swiper',
  data() {
    return {
      swiper: '',
      defaultOptions: {
        initialSlide: 0, //初始展示索引
        direction: 'horizontal', //水平/垂直展示
        speed: 300, //切换速度
        grabCursor: false, //拖动时显示手势 鼠标覆盖Swiper 时指针会变成手掌形状，拖动时指针会变成抓手形状
        watchSlidesProgress: true, // 子元素的活动进程
        setWrapperSize: false, // Swiper使用flexbox布局(display: flex)，开启这个设定会在Wrapper上添加等于slides相加的宽或高，在对flexbox布局的支持不是很好的浏览器中可能需要用到。
        virtualTranslate: false, // 滑动锁定
        width: undefined, //宽度
        height: undefined, //高度
        breakpoints: '', //响应式设置
        autoHeight: false, //自动高度。设置为 true 时，wrapper 和container 会随着当前slide 的高度而发生变化。
        loop: true,
        autoplay: {
          delay: 3000
        },
      }
    }
  },
  props: {
    options: {
      type: Object,
      default: () => {
        return {}
      }
    },
    showPagination: {
      type: Boolean,
      default: false
    },
    showNextBtb: {
      type: Boolean,
      default: false
    }
  },
  watch: {},
  components: {
    [Empty.name]: Empty
  },
  filters: {},
  methods: {},
  created() {
    let newOptions = Object.assign({}, this.defaultOptions, this.options)
    this.$nextTick(() => {
      console.log(newOptions)
      this.swiper = new Swiper(this.$refs.swiper, newOptions)
    })
  },
  mounted() {}
}
</script>
<style scoped lang="scss">
.m-swiper-container {
  height: 200px;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
