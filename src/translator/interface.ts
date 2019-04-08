import { MarkdownString } from 'vscode'


interface StandardResultInterface {
  markdown: MarkdownString,
  replaceableArr: Array<string>
}

interface TranslatorXFetchResult {
  translateResult: Array<MarkdownString>,
  replaceableArr: Array<string>
}

export {
  StandardResultInterface,
  TranslatorXFetchResult
}