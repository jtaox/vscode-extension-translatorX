import { URL } from "url"
import fetch from "./../utils/request"
import { MarkdownString, MarkedString } from 'vscode'

abstract class TranslatorAbstract {
  /**
   * api地址
   */
  abstract apiUrl: string

  /**
   * 获取参数
   * @param word 要翻译的文字
   */
  abstract getParams(word: string): any

  abstract parseRawResult(result: any): Array<any>

  /**
   * 用户选中的文字
   */
  private selectWord: string = ''

  /**
   * 获取翻译结果title
   * 也就是hover上显示的标题
   * 子类可以通过覆盖改方法修改默认title
   */
  protected getResultTitle (): string {
    return this.selectWord + '翻译结果'
  }

  /**
   * 获取完整url
   * @param url 接口地址
   * @param params 参数
   */
  public getUrlWithParams(url: string, params: any = {}): string {
    const urlObj = new URL(url)

    Object.keys(params).forEach(key => {
      urlObj.searchParams.append(key, params[key])
    })

    return urlObj.toString()
  }

  public fetchTranslationResult(word: string): Promise<any> {
    this.selectWord = word

    return fetch(this.getUrlWithParams(this.apiUrl, this.getParams(word)))
  }

  public async fetchStandardResult (word: string): Promise<MarkdownString> {
    const rawResult = await this.fetchTranslationResult(word)

    const title = this.getResultTitle()

    const result = this.parseRawResult(rawResult)

    const ms = new MarkdownString(title)

    if (!Array.isArray) {
      return ms.appendMarkdown(`* ${result} *`)
    }

    result.forEach((record: Array<string>)  => {
      const [pre, cont] = record
      ms.appendText('\n\n')
      ms.appendMarkdown(`- *${pre}*  ${cont}`)
    })

    return ms
  }
}

export default TranslatorAbstract
