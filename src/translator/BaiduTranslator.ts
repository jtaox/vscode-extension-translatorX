import ABaseTranslatorAbstract from './ABaseTranslatorAbstract'

class BadiduTranslator extends ABaseTranslatorAbstract {

  apiUrl = 'https://sp1.baidu.com/5b11fzupBgM18t7jm9iCKT-xh_/sensearch/selecttext'
  configSection = 'baidu'

  getParams(word: string): any {
    return {
      _: Date.now().toString(),
      q: word
    }
  }

  getResultTitle(): string {
    return 'baidu:'
  }

  parseRawResult(result: any) {
    const { errno, data } = result
    if (errno !== 0) {
      return 'api码错误' + errno
    }

    const { result: reqResult } = data

    if (typeof reqResult === 'string') return [[reqResult]]

    const res = reqResult.map(({pre,cont}: any) => {
      return [`*${pre}*`, cont]
    })

    return res

  }

  getReplaceableResult(rawResult: any): Array<string> {
    return []
  }

}

export default BadiduTranslator