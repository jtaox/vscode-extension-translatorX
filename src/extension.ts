"use strict"
import * as vscode from "vscode"
import TranslatorX from './TranslatorX'
import { trim } from './utils'

export function activate(context: vscode.ExtensionContext) {

	let { workspace, window, languages, commands, Uri } = vscode

	let translatorX = new TranslatorX(workspace.getConfiguration("TranslatorX"))

  let enable = vscode.commands.registerCommand("extension.enable", () => {
      translatorX.setTranslatorXState(true)
  })

  let disable = vscode.commands.registerCommand("extension.disable", () => {
    translatorX.setTranslatorXState(false)
	})

	let test = vscode.commands.registerCommand('extension.test', () => {
		let editor = window.activeTextEditor
		if (!editor) return
		const selection = editor && editor.selection
		const promise = commands.executeCommand('vscode.executeHoverProvider', workspace.textDocuments[0].uri, selection.active);
		promise.then(res => console.log(res))
	})
	
	let provider = {
		async provideHover(document: any, position: any, token: any) {
			let editor = window.activeTextEditor
			if (!editor) return
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
			
			string = string.replace(/\n/g,"")

			const arr = await translatorX.fetch({ word: string })
			if (arr) {
				let hover = new vscode.Hover(arr)
				return hover
			}
		}
	}

	languages.registerHoverProvider({ scheme: 'file', language: '*' }, provider)
	languages.registerHoverProvider({ scheme: 'untitled' }, provider)
	
	context.subscriptions.push(enable)
	context.subscriptions.push(disable)
	context.subscriptions.push(test)
}





export function deactivate() {}
