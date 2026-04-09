const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  db: {
    getInfo: () => ipcRenderer.invoke('db:get-info'),
  },
  prompts: {
    list: () => ipcRenderer.invoke('prompts:list'),
    create: (data) => ipcRenderer.invoke('prompts:create', data),
    update: (id, data) => ipcRenderer.invoke('prompts:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('prompts:delete', { id }),
  },
})
