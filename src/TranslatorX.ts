import axios from 'axios'
import { URL } from 'url'
import {md5 } from './utils'

const baiduApi = 'https://sp1.baidu.com/5b11fzupBgM18t7jm9iCKT-xh_/sensearch/selecttext'
const youdaoApi = 'https://openapi.youdao.com/api'
const secret = 'pZ1OO5dgK2UWnAjt3WOf1loIrtcmrJpg'

class TranslatorX {
  private conf: any
  private state: boolean
  public constructor(conf: any) {
    this.conf = conf
    this.state = this.getTrarnslatorXState()
  }

  public getTrarnslatorXState(): boolean {
    return this.conf.get('enable')
  }

  public setTranslatorXState(b: boolean) {
    this.conf.update('enable', b, true)
    this.state = b
  }

  async fetch(params: {
    word: string
  }) {
    this.fetchFromYoudao(params.word)
    return this.fetchFromBaidu({
      word: params.word
    })
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
    const appKey = 'appkey'
    const salt = Date.now().toString()
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

    const { statusText, data } = await axios.get(url.toString())
    console.log(statusText, data, '====')
  }

  // 有道api 获取签名
  getSign({
    appKey,q,salt,secret
  }: any) {
    return md5(appKey + q + salt + secret)
  }
}

export default TranslatorX
