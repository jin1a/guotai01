export default {
  name: 'view',
  components: {},
  props: {
    ownerList: {
      type: Object,
      default: {
        list: []
      }
    }
  },
  mounted() {},
  watch: {
    ownerList() {
      console.log('数据更新')
    }
  },
  render(h) {
    return (
      <div class={'app-container'}>
        {this.ownerList.list.map((item) => {
          return h(item.code, {
            props: {
              pageList: this.ownerList.list,
              propList: item.content ? item.content : null,
              id: this.$route.query.saleId,
              item: item
            }
          })
        })}
      </div>
    )
  }
}
