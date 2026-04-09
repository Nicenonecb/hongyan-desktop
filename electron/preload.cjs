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
  works: {
    list: () => ipcRenderer.invoke('works:list'),
    insert: (data) => ipcRenderer.invoke('works:insert', data),
    getById: (id) => ipcRenderer.invoke('works:get-by-id', { id }),
  },
})
