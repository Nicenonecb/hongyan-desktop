const fs = require('node:fs')
const path = require('node:path')
const Database = require('better-sqlite3')
const { drizzle } = require('drizzle-orm/better-sqlite3')
const { desc, eq } = require('drizzle-orm')
const { integer, sqliteTable, text } = require('drizzle-orm/sqlite-core')

const promptsTable = sqliteTable('prompts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  content: text('content').notNull(),
  tags: text('tags').notNull().default('[]'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

function createPromptStore({ dbFilePath }) {
  fs.mkdirSync(path.dirname(dbFilePath), { recursive: true })

  const sqlite = new Database(dbFilePath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  const db = drizzle(sqlite)

  const parseTags = (rawTags) => {
    try {
      const parsed = JSON.parse(rawTags)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }

  const mapPrompt = (row) => ({
    id: row.id,
    name: row.name,
    content: row.content,
    tags: parseTags(row.tags),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })

  const getById = (id) => {
    const row = db.select().from(promptsTable).where(eq(promptsTable.id, id)).get()
    return row ? mapPrompt(row) : null
  }

  const listPrompts = () => {
    const rows = db.select().from(promptsTable).orderBy(desc(promptsTable.updatedAt)).all()
    return rows.map(mapPrompt)
  }

  const createPrompt = (input) => {
    const now = Date.now()
    const name = String(input?.name ?? '').trim() || '未命名提示词'
    const content = String(input?.content ?? '')
    const tags = Array.isArray(input?.tags) ? input.tags.map((item) => String(item).trim()).filter(Boolean) : []

    const result = db
      .insert(promptsTable)
      .values({
        name,
        content,
        tags: JSON.stringify(tags),
        createdAt: now,
        updatedAt: now,
      })
      .run()

    return getById(Number(result.lastInsertRowid))
  }

  const updatePrompt = (id, input) => {
    const existing = getById(id)
    if (!existing) return null

    const patch = {}

    if (input && Object.prototype.hasOwnProperty.call(input, 'name')) {
      patch.name = String(input.name ?? '').trim() || existing.name
    }

    if (input && Object.prototype.hasOwnProperty.call(input, 'content')) {
      patch.content = String(input.content ?? '')
    }

    if (input && Object.prototype.hasOwnProperty.call(input, 'tags')) {
      const tags = Array.isArray(input.tags) ? input.tags.map((item) => String(item).trim()).filter(Boolean) : []
      patch.tags = JSON.stringify(tags)
    }

    patch.updatedAt = Date.now()

    db.update(promptsTable).set(patch).where(eq(promptsTable.id, id)).run()
    return getById(id)
  }

  const deletePrompt = (id) => {
    const result = db.delete(promptsTable).where(eq(promptsTable.id, id)).run()
    return result.changes > 0
  }

  const close = () => {
    sqlite.close()
  }

  return {
    listPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    close,
  }
}

module.exports = {
  createPromptStore,
}
