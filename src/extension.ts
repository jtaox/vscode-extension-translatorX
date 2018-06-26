"use strict"
import * as vscode from "vscode"
import TranslatorX from './TranslatorX'

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-translatorx" is now active!'
  )

	let { workspace, window, languages } = vscode
	let editor = window.activeTextEditor
	console.log(editor)
	if (!editor) return

	let translatorX = new TranslatorX(workspace.getConfiguration("translatorX"))

  let enable = vscode.commands.registerCommand("extension.enable", () => {
      translatorX.setTranslatorXState(true)
  })

  let disable = vscode.commands.registerCommand("extension.disable", () => {
    translatorX.setTranslatorXState(false)
	})
	
	let provider = {
		async provideHover(document: any, position: any, token: any) {
			const selection = editor && editor.selection

			// range可能为空
			let range = document.getWordRangeAtPosition(position)
			let string = range ? document.getText(range) : ""

			if (selection && !selection.isEmpty) {
				let text = document.getText(selection)
				// position在selection范围内
				// (selection.contains(range) || ~string.indexOf(text)) && (string = text)
				if (selection.contains(range) || ~string.indexOf(text)) string = text
			}

			string = trim(string)
			if (!string) return
			const arr = await translatorX.fetch({ word: string })
			
			if (arr) {
				arr.unshift(`'${ string }'翻译结果:`)
					let hover = new vscode.Hover(
						arr.map((item: string) => new vscode.MarkdownString(item))
				)
				return hover
			}
		}
	}

	languages.registerHoverProvider({ scheme: 'file', language: '*' }, provider)

	context.subscriptions.push(enable)
	context.subscriptions.push(disable)
}

const reg = /^[^\u4e00-\u9fa5\w]*|[^\u4e00-\u9fa5\w]*$/g

function trim(str: string): string {
  return str.trim().replace(reg, '')
}

export function deactivate() {}
