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

  type WorkRecord = {
    id: number
    title: string
    category: string
    message: string
    attachments: string[]
    chapters: string[]
    library: string[]
    characters: string[]
    lore: string[]
    outline: string[]
    createdAt: number
    updatedAt: number
  }

  type WorkInput = {
    title?: string
    category: string
    message: string
    attachments: string[]
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
    works: {
      list: () => Promise<WorkRecord[]>
      insert: (data: WorkInput) => Promise<WorkRecord>
      getById: (id: number) => Promise<WorkRecord | null>
    }
  }

  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
