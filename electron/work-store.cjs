const fs = require('node:fs')
const path = require('node:path')
const Database = require('better-sqlite3')
const { drizzle } = require('drizzle-orm/better-sqlite3')
const { desc, eq } = require('drizzle-orm')
const { integer, sqliteTable, text } = require('drizzle-orm/sqlite-core')

const worksTable = sqliteTable('works', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  message: text('message').notNull().default(''),
  attachments: text('attachments').notNull().default('[]'),
  chapters: text('chapters').notNull().default('[]'),
  library: text('library').notNull().default('[]'),
  characters: text('characters').notNull().default('[]'),
  lore: text('lore').notNull().default('[]'),
  outline: text('outline').notNull().default('[]'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

function toArray(rawValue) {
  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : []
  } catch {
    return []
  }
}

function inferTitle(inputTitle, message, now) {
  const preferred = String(inputTitle ?? '').trim()
  if (preferred) return preferred

  const firstLine = String(message ?? '')
    .split('\n')
    .map((item) => item.trim())
    .find(Boolean)

  if (firstLine) return firstLine.slice(0, 24)

  const iso = new Date(now).toISOString().slice(0, 16).replace('T', ' ')
  return `新作品 ${iso}`
}

function createWorkStore({ dbFilePath }) {
  fs.mkdirSync(path.dirname(dbFilePath), { recursive: true })

  const sqlite = new Database(dbFilePath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      attachments TEXT NOT NULL DEFAULT '[]',
      chapters TEXT NOT NULL DEFAULT '[]',
      library TEXT NOT NULL DEFAULT '[]',
      characters TEXT NOT NULL DEFAULT '[]',
      lore TEXT NOT NULL DEFAULT '[]',
      outline TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  const db = drizzle(sqlite)

  const mapWork = (row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    message: row.message,
    attachments: toArray(row.attachments),
    chapters: toArray(row.chapters),
    library: toArray(row.library),
    characters: toArray(row.characters),
    lore: toArray(row.lore),
    outline: toArray(row.outline),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })

  const getWorkById = (id) => {
    const row = db.select().from(worksTable).where(eq(worksTable.id, id)).get()
    return row ? mapWork(row) : null
  }

  const listWorks = () => {
    const rows = db.select().from(worksTable).orderBy(desc(worksTable.updatedAt)).all()
    return rows.map(mapWork)
  }

  const createWork = (input) => {
    const now = Date.now()
    const message = String(input?.message ?? '').trim()
    const title = inferTitle(input?.title, message, now)
    const category = String(input?.category ?? '').trim() || '未分类'
    const attachments = Array.isArray(input?.attachments)
      ? input.attachments.map((item) => String(item).trim()).filter(Boolean)
      : []

    const initialOutline = message ? [message] : []

    const result = db
      .insert(worksTable)
      .values({
        title,
        category,
        message,
        attachments: JSON.stringify(attachments),
        chapters: JSON.stringify([]),
        library: JSON.stringify(attachments),
        characters: JSON.stringify([]),
        lore: JSON.stringify([]),
        outline: JSON.stringify(initialOutline),
        createdAt: now,
        updatedAt: now,
      })
      .run()

    return getWorkById(Number(result.lastInsertRowid))
  }

  const close = () => {
    sqlite.close()
  }

  return {
    listWorks,
    createWork,
    getWorkById,
    close,
  }
}

module.exports = {
  createWorkStore,
}
