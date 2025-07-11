// import request from '@/assets/js/utils/request'
// import getUrl from '@/assets/js/utils/get-url'
// export default {
// }
import { post, get } from '@/assets/js/utils/request'

// ***什么功能api
export const save = (params) => post('/...', params)

/**
 * @description: 获取banner列表
 * @param {*} orgId：组织ID，pageNo:页码,pageSize:条数
 * @return {*}
 */
export const getBannerList = (params) => post('/api/common/v1/banner/listBanner', params)