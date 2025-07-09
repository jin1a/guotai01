<template>
  <div class="steps">  
    <div class="step2">
      <div class="content" v-for="item in total" :key="item">
        <div class="iconContent">
          <div class="nub1" v-if="item == nub">{{item}}</div>
          <div class="nub2" v-else-if="item > nub">{{item}}</div>
          <div class="icon"  v-if="item < nub">        
            <img width="24" height="24" :src="icon1" alt="icon1" />        
          </div>
        </div>      
        <div class="title" v-if="item == nub">{{title}}</div>
      </div>
    </div>   
  </div>
</template>
<script>
import icon1 from '../../assets/images/icons/icon1.svg';
export default {
  name: 'Steps',
  components: {},
  props: {
    total: {
      type: Number,
      default: 5
    },
    nub: {
      type: Number,
      default: 3
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      icon1
    }
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
  
}
.step2{padding-top: 26px;}
.steps .content {
 float: left; padding: 0 0 0 10px; 
}
.iconContent{float: left;}
.nub1{width:24px ;height:24px;background: #F39800;border-radius: 50%;color: #fff;text-align: center;line-height: 24px;font-size: 16px;}
.nub2{width:24px ;height:24px;background: #fff;border-radius: 50%;color: #00975F;text-align: center;line-height: 24px;font-size: 16px;}
.title{font-size: 14px;line-height: 24px; color: #fff;float: left;padding: 0 10px;}

</style>
