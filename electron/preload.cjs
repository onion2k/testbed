const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktopBridge', {
  isDesktop: true,
  getContext: () => ipcRenderer.invoke('desktop:get-context'),
  selectDataDirectory: () => ipcRenderer.invoke('desktop:select-data-directory'),
  openDataDirectory: () => ipcRenderer.invoke('desktop:open-data-directory'),
})
