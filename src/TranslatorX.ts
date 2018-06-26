import axios from "axios"
import { URL } from "url"

const baiduApi = 'https://sp1.baidu.com/5b11fzupBgM18t7jm9iCKT-xh_/sensearch/selecttext'

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
    let { word } = params
    if (!this.state) return
    const url = new URL(baiduApi)
    url.searchParams.append('_', Date.now().toString())
    url.searchParams.append('q', word)
    let arr = undefined
    try {
      const { statusText, data } = await axios.get(url.toString())
      if (statusText === 'OK') {
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
      }
    } catch (error) {
      arr =  [`api error- ${ error.toString() }`]
    }
    return arr
  }
}

export default TranslatorX