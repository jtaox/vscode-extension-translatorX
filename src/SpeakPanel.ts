import { window, WebviewPanel, ViewColumn, Uri } from "vscode"
import { join } from "path";
import { readFileSync } from "fs";

const SEPAK_APP_DIR = 'speakApp'

class SpeakPanel {
  private static panel: SpeakPanel | undefined
  private webviewPanel: WebviewPanel
  private extensionPath: string

  constructor(extensionPath: string) {
    this.extensionPath = extensionPath

    this.webviewPanel = window.createWebviewPanel("SpeakPanel", "SpeakPanel", {
      preserveFocus: false,
      viewColumn: ViewColumn.Active
    }, {
      localResourceRoots: [Uri.file(join(extensionPath, 'speakApp'))],
      enableScripts: true
    })

    this.inintWebview()
  }

  private inintWebview(): void {
    const html = readFileSync(join(this.extensionPath, SEPAK_APP_DIR, 'index.html'), 'utf8')
    this.webviewPanel.webview.html = this.templateFormat(html)
  }

  public play(url: string): void {
    this.postMessage({ command: 'play', args: { url } })
  }

  public static getInstance(extensionPath: string): SpeakPanel {
    if (!SpeakPanel.panel) {
      SpeakPanel.panel = new SpeakPanel(extensionPath)
    }

    return SpeakPanel.panel
  }

  private postMessage(data: any) {
    console.log(data, ' post message ')
    this.webviewPanel.webview.postMessage(data)
  }

  private templateFormat(template: string) {
    const scriptUrlReg = /\$\{scriptUrl\}/g

    const tp = template.replace(scriptUrlReg, this.getVSResource('speak.js'))

    return tp
  }

  private getVSResource(fileName: string): string {
    const resourcePath = Uri.file(join(this.extensionPath, SEPAK_APP_DIR, fileName))

    return resourcePath.with({ scheme: 'vscode-resource' }).toString()
  }
}

export default SpeakPanel
