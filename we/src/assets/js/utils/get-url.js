import config from '@/config'
import urlMap from '@/config/urlMap'

export default function getUrl(url) {
  return config.apiAdmin + url
}
