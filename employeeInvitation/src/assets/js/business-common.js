/*
 * 业务公用js，根据app具体场景写公用方法
 */
// 截取地址栏的参数值
function getUrlParam(data, href) {
  let hrefUrl = href ? href : window.location.href
  const reg = new RegExp('(^|&)' + data + '=([^&]*)(&|$)')
  var r = hrefUrl.substr(1).match(reg)
  if (r != null) {
    return decodeURIComponent(r[2])
  }
  return ''
}
export default getUrlParam
