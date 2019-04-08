import axios from 'axios'
import { URL } from 'url'
import { md5 } from './utils'
import BaiduTranslator from './translator/BaiduTranslator'
import YoudaoTranslator from './translator/YoudaoTranslator'
import { TranslatorXFetchResult } from './translator/interface'
import { MarkdownString } from 'vscode';

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
  private baiduTranslator: BaiduTranslator
  private youdaoTranslator: YoudaoTranslator

  public constructor(conf: any) {
    this.conf = conf

    this.state = this.getTrarnslatorXState()


    this.baiduTranslator = new BaiduTranslator()
    this.youdaoTranslator = new YoudaoTranslator()

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
  }): Promise<TranslatorXFetchResult> {

    const result = []
    const replaceable = []

    if (this.youdaoTranslator.getStatus()) {
      const { markdown, replaceableArr } = await this.youdaoTranslator.fetchStandardResult(params.word)
      result.push(markdown)
      replaceable.push(...replaceableArr)
    }

    if (this.baiduTranslator.getStatus()) {
      const { markdown, replaceableArr } = await this.baiduTranslator.fetchStandardResult(params.word)
      result.push(markdown)
      replaceable.push(...replaceableArr)
    }

    return {
      translateResult: result,
      replaceableArr: replaceable
    }
  }

}

export default TranslatorX
