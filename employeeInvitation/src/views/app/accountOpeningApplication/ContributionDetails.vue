<template>
  <div class="contributionDetails">
    <HeaderBack title="供款詳情"></HeaderBack>
    <Steps></Steps>
  </div>
</template>
<script>
import HeaderBack from '@/components/header/HeaderBack.vue'
import Steps from '@/components/steps/Steps.vue'
export default {
  name: 'ContributionDetails',
  components: {
    HeaderBack,
    Steps
  },
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
