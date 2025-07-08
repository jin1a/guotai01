export default {
    formatLabelFun: (value, dir) => {
        let arr = eval(`${dir}DataMaps`)
        let filterData = arr.filter(item => item.value == value)[0]
        if (filterData) {
            return filterData.label
        } else {
            return value
        }
    },

    formatList: (dir) => {
        let maps = {}
        return maps[dir];
    },

    // formatOptionsFun 固定生成
    // 用于转换list 增加自己想要的字段
    formatOptionsFun: function (array = [{label: 'name', formatLabel: 'label'}], data) {
        return data.map(item => {
            array.map(format => {
                if (item[format.label]) {
                    item[format.formatLabel ? format.formatLabel : 'label'] = item[format.label]
                }
                if (item.children && item.children.length > 0) {
                    item.children = this.formatOptionsFun(array, item.children)
                }
            })
            return item
        })
    }
}