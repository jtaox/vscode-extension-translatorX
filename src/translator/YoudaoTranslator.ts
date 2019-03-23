import ABaseTranslatorAbstract from './ABaseTranslatorAbstract'
import { getYoudaoSign } from './../utils'

class YoudaoTranslator extends ABaseTranslatorAbstract {
  apiUrl = 'https://openapi.youdao.com/api'
  configSection = 'youdao'

  getParams(q: string): any {
    const youdaoConfig = this.getConfig(this.configSection) || {}
    const { secret, appKey } = youdaoConfig
    const salt = Date.now().toString()

    const sign = getYoudaoSign({appKey, q, salt, secret})

    return {
      appKey,
      secret,
      salt,
      sign,
      q,
      from: 'auto',
      to: 'auto',
    }
  }

  getResultTitle(): string {
    return 'youdao API:'
  }

  parseRawResult(result: any) {
    const { web = [], query = '', translation = [], errorCode = '', basic = {} } = result
    const { explains } = basic

    if (errorCode != 0) {
      return '❌' + errorCode
    }

    const arrayResult = []

    if (translation && translation.length) {
      arrayResult.push(...translation.map((item: string) => `- ${item}`))
    }

    if (explains && explains.length) {
      arrayResult.push('基本释义:')
      arrayResult.push(...explains.map((item: string) => `- ${item}`))
    }

    if (web && web.length) {
      arrayResult.push('网络释义:')
      web.forEach((item: any) => {
        arrayResult.push([item.key, item.value.join('、')])
      })
    }


    return arrayResult

  }

}

export default YoudaoTranslator