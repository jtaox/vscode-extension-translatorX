const crypto = require('crypto')
const md5Hash = crypto.createHash('md5')

export const md5 = (content: string) => {
  return md5Hash.update(content).digest('hex')
}