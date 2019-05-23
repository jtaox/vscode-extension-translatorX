"use strict"
import * as vscode from "vscode"
import TranslatorX from './TranslatorX'
import { trim } from './utils'

export function activate(context: vscode.ExtensionContext) {

	let { window, languages, commands, } = vscode

	let gReplaceableArr: Array<string> = []
	let gReplaceableIndex: number = 0
	// let gRepTimer: number = null

	let translatorX = new TranslatorX()

  let enable = vscode.commands.registerCommand("extension.enable", () => {
      translatorX.setTranslatorXState(true)
  })

  let disable = vscode.commands.registerCommand("extension.disable", () => {
    translatorX.setTranslatorXState(false)
	})

	let replaceWithTranslationResults = vscode.commands.registerTextEditorCommand('extension.replaceWithTranslationResults', (textEditor, edit) => {
		let editor = window.activeTextEditor
		if (!editor) return
		const selection = editor && editor.selection

		edit.replace(selection, gReplaceableArr[gReplaceableIndex % gReplaceableArr.length])
		gReplaceableIndex++
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

			const { replaceableArr, translateResult } = await translatorX.fetch({ word: string })
			
			gReplaceableArr = replaceableArr
			gReplaceableIndex = 0

			if (translateResult) {
				let hover = new vscode.Hover(translateResult)
				return hover
			}
			
		}
	}

	languages.registerHoverProvider({ scheme: 'file', language: '*' }, provider)
	languages.registerHoverProvider({ scheme: 'untitled' }, provider)
	
	context.subscriptions.push(enable)
	context.subscriptions.push(disable)
	context.subscriptions.push(replaceWithTranslationResults)
}





export function deactivate() {}
