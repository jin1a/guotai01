import JSEncrypt from 'jsencrypt'

// RSA 公钥 - 这个需要和后端提供的公钥保持一致
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8HMr2CBpoZPm3t9tCmv2/EN7t
g/399W4QEFYYoWtUvibF7p+TcNqJixgQC8h9xIfqYT5N9HTxMgOX8UQqPR4xxXWW
4E2+EJPyr/VnH5hf3+NiBvEZf1ZsuT4QHJBTw+/W6YCY5iXauYBhQrBOZ2ektOW/
SKWm2SXCojSNgGqB1QIDAQAB
-----END PUBLIC KEY-----`

/**
 * RSA加密
 * @param {string} text 需要加密的文本
 * @returns {string} 加密后的文本
 */
export function rsaEncrypt(text) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(PUBLIC_KEY)
  return encryptor.encrypt(text)
} 