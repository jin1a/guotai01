/**
 * 图片资源工具函数
 */

/**
 * 获取图片资源路径
 * @param {string} imageName 图片文件名（包含扩展名）
 * @returns {string} 图片完整路径
 */
export function getImageUrl(imageName) {
  return new URL(`../assets/images/${imageName}`, import.meta.url).href
}

/**
 * 预加载图片
 * @param {string} imageUrl 图片路径
 * @returns {Promise<HTMLImageElement>} 加载完成的图片元素
 */
export function preloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageUrl
  })
} 