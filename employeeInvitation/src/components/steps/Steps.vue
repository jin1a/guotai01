<template>
  <div class="steps">
    <div class="content"></div>
    <div class="footer"></div>
  </div>
</template>
<script>
export default {
  name: 'Steps',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
}
</script>
<style scoped>
.steps {
  height: 80px;
  background: url(../../assets/images/bg1.png) no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
}
.steps .content {
  height: 1px;
  flex: 1;
}
.steps .footer {
  border-radius: 12px 12px 0 0;
  height: 24px;
  background: #fff;
}
</style>
