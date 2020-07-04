import { URL } from "url"
import fetch from "./../utils/request"
import { StandardResultInterface } from './interface'
import { MarkdownString, workspace, WorkspaceConfiguration, Uri } from 'vscode'

const EXTENSION_NAME = 'TranslatorX'
const ICON_PLAY = '🗣'
const ICON_STOP = '◼︎'

abstract class TranslatorAbstract {

  /**
   * api地址
   */
  abstract apiUrl: string

  /**
   * 配置命名空间
   */
  abstract configSection: string

  private extensionConfig: WorkspaceConfiguration

  constructor () {
    this.extensionConfig = workspace.getConfiguration(EXTENSION_NAME)
  }

  /**
   * 获取参数
   * @param word 要翻译的文字
   */
  abstract getParams(word: string): any

  abstract parseRawResult(result: any): Array<any> | string

  /**
   * 用户通过快捷键可以替换的内容数组 由子类实现
   * @param rawResult 接口返回内容
   */
  abstract getReplaceableResult(rawResult: any): Array<string>

  /**
   * 获取当前翻译设置状态
   */
  getStatus(): boolean {
    const currentConfig = this.getConfig(this.configSection) || {}

    return Boolean(currentConfig.enable)
  }

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
   * 获取播放url，子类可选实现
   */
  protected getSpeakUrl(result: any): string | undefined {
    return undefined
  }

  getConfig (section: string): any {
    return this.extensionConfig.get(section)
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
    let params = undefined
    let errorMsg = null

    try {
      params = this.getParams(word)
    } catch (error) {
      errorMsg = error.message
    }

    if (params) {
      return fetch(this.getUrlWithParams(this.apiUrl, params))
    } else {
      return Promise.resolve({ error: errorMsg })
    }
    
  }

  public async fetchStandardResult (word: string): Promise<StandardResultInterface> {
    const rawResult = await this.fetchTranslationResult(word)

    const title = this.getResultTitle()
    const speakUrl = this.getSpeakUrl(rawResult)

    const ms = new MarkdownString(title)
    ms.appendText('\n\n')

    if (rawResult.error) {
      return {markdown: ms.appendMarkdown(`❌ ${ rawResult.error }`), replaceableArr: []}
    }

    const result = this.parseRawResult(rawResult)

    if (!Array.isArray(result)) {
      return {markdown: ms.appendMarkdown(`* ${result} *`), replaceableArr: []}
    }
    
    result.forEach((record: Array<string>)  => {
      if (Array.isArray(record)) {
        record.forEach(item => ms.appendMarkdown(`- ${item}`) && ms.appendText('  '))
      } else {
        ms.appendMarkdown(record)
      }
      ms.appendText('\n\n')
    })

    if (speakUrl) {
      ms.appendMarkdown(this.getSpeakActionMarkdown(speakUrl))
      ms.isTrusted = true
    }
    
    const replaceable = this.getReplaceableResult(rawResult)

    return {markdown: ms, replaceableArr: replaceable}
  }

  private getSpeakActionMarkdown(speakUrl: string): string {
    const url = Uri.parse(
      `command:extension.test?${encodeURIComponent(JSON.stringify({ speakUrl }))}`
    );
    console.log(url.toString())
    return `[${ICON_PLAY}](${url})&nbsp;`
  }
}

export default TranslatorAbstract
