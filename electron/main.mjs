import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as electron from 'electron/main'

const { app, BrowserWindow, dialog, ipcMain, shell } = electron

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.argv.includes('--dev')
const settingsFileName = 'desktop-settings.json'
const preferredPort = 5175

let mainWindow = null
let runtime = null
let currentDataDirectory = null

async function loadServerModule() {
  return import(path.join(__dirname, '..', 'server', 'create-server.mjs'))
}

function settingsPath() {
  return path.join(app.getPath('userData'), settingsFileName)
}

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath(), 'utf8'))
  } catch {
    return {}
  }
}

function writeSettings(settings) {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true })
  const tempPath = `${settingsPath()}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(settings, null, 2))
  fs.renameSync(tempPath, settingsPath())
}

async function chooseDataDirectory(initialPath) {
  const result = await dialog.showOpenDialog({
    title: 'Choose Testbed data folder',
    defaultPath: initialPath,
    properties: ['openDirectory', 'createDirectory'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
}

function desktopContext() {
  return {
    serverUrl: runtime?.serverUrl ?? null,
    port: runtime?.port ?? null,
    usedFallbackPort: runtime?.usedFallbackPort ?? false,
    dataDirectory: currentDataDirectory,
    adminApiToken: runtime?.adminApiToken ?? null,
  }
}

async function startRuntime(dataDirectory) {
  if (runtime) {
    await runtime.close()
  }

  currentDataDirectory = dataDirectory
  const { startTestbedServer } = await loadServerModule()
  runtime = await startTestbedServer({
    dataDirectory,
    preferredPort,
    dev: isDev,
    desktopContextProvider: desktopContext,
  })
}

async function ensureDataDirectory() {
  const settings = readSettings()
  let directory = settings.dataDirectory

  if (!directory || !fs.existsSync(directory)) {
    directory = await chooseDataDirectory(app.getPath('documents'))
  }

  if (!directory) {
    app.quit()
    return null
  }

  writeSettings({ ...settings, dataDirectory: directory })
  return directory
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  await mainWindow.loadURL(`${runtime.serverUrl}/desktop`)
}

ipcMain.handle('desktop:get-context', async () => desktopContext())

ipcMain.handle('desktop:open-data-directory', async () => {
  if (currentDataDirectory) {
    await shell.openPath(currentDataDirectory)
  }

  return desktopContext()
})

ipcMain.handle('desktop:select-data-directory', async () => {
  const nextDirectory = await chooseDataDirectory(currentDataDirectory ?? app.getPath('documents'))

  if (!nextDirectory) {
    return desktopContext()
  }

  writeSettings({ ...readSettings(), dataDirectory: nextDirectory })
  await startRuntime(nextDirectory)

  if (mainWindow) {
    await mainWindow.loadURL(`${runtime.serverUrl}/desktop`)
  }

  return desktopContext()
})

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    if (runtime) {
      await runtime.close()
    }
    app.quit()
  }
})

app.whenReady().then(async () => {
  const dataDirectory = await ensureDataDirectory()

  if (!dataDirectory) {
    return
  }

  await startRuntime(dataDirectory)
  await createMainWindow()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow()
    }
  })
})
