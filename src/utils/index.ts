const crypto = require('crypto')
const md5Hash = crypto.createHash('md5')

const reg = /^[^\u4e00-\u9fa5\w]*|[^\u4e00-\u9fa5\w]*$/g

export const md5 = (content: string) => {
  return md5Hash.update(content).digest('hex')
}

// 有道api 获取签名
export const getYoudaoSign = ({ appKey, q, salt, secret }: any): string => {
  return md5(appKey + q + salt + secret)
}

export const trim = (str: string): string => {
  return str.trim().replace(reg, '')
}