import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { chromium } from 'playwright'
// import type { BrowserContext, Page } from 'playwright'

// Custom APIs for renderer
const api = {
  async test(): Promise<void> {
    const browser = await chromium.launch({
      headless: false
    })
    const context = await browser.newContext({
      viewport: { width: 1500, height: 1080 }
    })
    const page = await context.newPage()
    await page.goto('https://www.baidu.com/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await page.fill('#kw', '1212')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
