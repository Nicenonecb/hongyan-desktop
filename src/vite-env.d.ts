/// <reference types="vite/client" />

declare global {
  type PromptRecord = {
    id: number
    name: string
    content: string
    tags: string[]
    createdAt: number
    updatedAt: number
  }

  type PromptInput = {
    name: string
    content: string
    tags: string[]
  }

  type DbInfo = {
    dbFilePath: string
    worksDir: string
  }

  interface ElectronAPI {
    platform: string
    db: {
      getInfo: () => Promise<DbInfo>
    }
    prompts: {
      list: () => Promise<PromptRecord[]>
      create: (data: PromptInput) => Promise<PromptRecord>
      update: (id: number, data: Partial<PromptInput>) => Promise<PromptRecord | null>
      delete: (id: number) => Promise<boolean>
    }
  }

  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
