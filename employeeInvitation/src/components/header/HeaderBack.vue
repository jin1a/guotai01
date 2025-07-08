<template>
  <div class="headerBack">
    <van-nav-bar :title="title" left-arrow @click-left="onClickLeft"></van-nav-bar>
  </div>
</template>
<script>
import { NavBar } from 'vant'
export default {
  name: 'HeaderBack',
  components: {
    [NavBar.name]: NavBar
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    }
  }
}
</script>
