const path = require('node:path')
const { app, BrowserWindow, ipcMain } = require('electron')
const { createPromptStore } = require('./prompt-store.cjs')
const { createWorkStore } = require('./work-store.cjs')

let promptStore = null
let workStore = null

function registerIpcHandlers({ dbFilePath }) {
  ipcMain.handle('db:get-info', () => {
    const worksDir = path.join(app.getPath('documents'), 'Hongyan Desktop', 'works')
    return {
      dbFilePath,
      worksDir,
    }
  })

  ipcMain.handle('prompts:list', () => promptStore.listPrompts())

  ipcMain.handle('prompts:create', (_event, payload) => promptStore.createPrompt(payload))

  ipcMain.handle('prompts:update', (_event, payload) =>
    promptStore.updatePrompt(Number(payload?.id), payload?.data ?? {}),
  )

  ipcMain.handle('prompts:delete', (_event, payload) =>
    promptStore.deletePrompt(Number(payload?.id)),
  )

  ipcMain.handle('works:list', () => workStore.listWorks())

  ipcMain.handle('works:insert', (_event, payload) => workStore.createWork(payload))

  ipcMain.handle('works:get-by-id', (_event, payload) =>
    workStore.getWorkById(Number(payload?.id)),
  )
}

function createMainWindow() {
  const isMac = process.platform === 'darwin'
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    ...(isMac
      ? {
          titleBarStyle: 'hiddenInset',
          trafficLightPosition: { x: 16, y: 13 },
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) {
    win.loadURL(devServerUrl)
    win.webContents.openDevTools({ mode: 'detach' })
    return
  }

  win.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(() => {
  const dbFilePath = path.join(app.getPath('userData'), 'hongyan.db')
  promptStore = createPromptStore({ dbFilePath })
  workStore = createWorkStore({ dbFilePath })
  registerIpcHandlers({ dbFilePath })

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('before-quit', () => {
  promptStore?.close()
  workStore?.close()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
