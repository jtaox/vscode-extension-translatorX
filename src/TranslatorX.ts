import axios from 'axios'
import { URL } from 'url'
import { md5 } from './utils'
import BaiduTranslator from './translator/BaiduTranslator'

const baiduApi = 'https://sp1.baidu.com/5b11fzupBgM18t7jm9iCKT-xh_/sensearch/selecttext'
const youdaoApi = 'https://openapi.youdao.com/api'

interface YoudaoConfig {
  secret: string,
  appKey: string,
  enable: boolean
}

class TranslatorX {
  private conf: any
  private state: boolean
  private youdaoState: boolean
  private youdaoSecret: string
  private youdaoAppKey: string
  private baiduTranslator: BaiduTranslator

  public constructor(conf: any) {
    this.conf = conf

    const { enable, secret, appKey } = this.getYoudaoApiConfig()
    this.state = this.getTrarnslatorXState()

    this.youdaoState = enable
    this.youdaoSecret = secret
    this.youdaoAppKey = appKey

    this.baiduTranslator = new BaiduTranslator()

  }

  public getTrarnslatorXState(): boolean {
    return this.conf.get('enable')
  }

  public setTranslatorXState(b: boolean) {
    this.conf.update('enable', b, true)
    this.state = b
  }

  public getYoudaoApiConfig(): YoudaoConfig {
    return this.conf.get('youdao')
  }

  async fetch(params: {
    word: string
  }) {
    return this.baiduTranslator.fetchStandardResult(params.word)
  }

  handleBaiduResult(data: any): Array<string> {
    let arr = undefined
    const { errno, data: { type, result } } = data
    if (!errno) {
      if (type == 1) {
        arr = result.map((item: any) => `- ${ item.pre ? `*${item.pre}*` : '' } ${ item.cont }`)
      } else {
        arr = [`- ${result}`]
      }
    } else {
      arr = [`result error-${errno}`]
    }
    return arr
  }

  handleYoudaoResult(data: any): Array<String> {
    console.log(data)

    return []
  }

  async fetchFromBaidu(params: {
    word: string
  }) {
    let { word } = params
    if (!this.state) return
    const url = new URL(baiduApi)
    url.searchParams.append('_', Date.now().toString())
    url.searchParams.append('q', word)
    let arr = null
    try {
      const { statusText, data } = await axios.get(url.toString())
      if (statusText === 'OK') {
        arr = this.handleBaiduResult(data)
      } else {
        arr = [`status error- ${ statusText }`]
      }
    } catch (error) {
      arr =  [`api error- ${ error.toString() }`]
    }
    return arr
  }

  async fetchFromYoudao(
    word: string
  ) {
    
    const url = new URL(youdaoApi)
    const appKey = this.youdaoAppKey
    const salt = Date.now().toString()
    const secret = this.youdaoSecret
    
    const sign = this.getSign({
      appKey, q: word, salt, secret
    })
    url.searchParams.append('from', 'auto')
    url.searchParams.append('to', 'auto')
    url.searchParams.append('appKey', appKey)
    url.searchParams.append('salt', salt)
    url.searchParams.append('ext', 'mp3')
    url.searchParams.append('sign', sign)
    url.searchParams.append('q', word)
    
    let result = null
    try {
      result = await axios.get(url.toString())
    } catch (error) {
      console.log('request error', error)
    }

    if (!result) return
    
    const { statusText, data } = result
    if (statusText === 'OK') {
      this.handleYoudaoResult(data)
    }
  }

  // 有道api 获取签名
  getSign({
    appKey,q,salt,secret
  }: any) {
    return md5(appKey + q + salt + secret)
  }
}

export default TranslatorX
