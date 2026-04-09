import { useEffect, useMemo, useState } from 'react'

function toTags(input: string) {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toTagString(tags: string[]) {
  return tags.join(', ')
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

export function PromptManager() {
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null)
  const [prompts, setPrompts] = useState<PromptRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newName, setNewName] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')

  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')

  const hasElectronApi = typeof window !== 'undefined' && !!window.electronAPI?.prompts

  const selectedPrompt = useMemo(
    () => prompts.find((item) => item.id === selectedPromptId) ?? null,
    [prompts, selectedPromptId],
  )

  const syncSelection = (prompt: PromptRecord | null) => {
    setSelectedPromptId(prompt?.id ?? null)
    setEditName(prompt?.name ?? '')
    setEditContent(prompt?.content ?? '')
    setEditTags(prompt ? toTagString(prompt.tags) : '')
  }

  const refreshPrompts = async () => {
    const list = await window.electronAPI.prompts.list()
    setPrompts(list)
    if (list.length === 0) {
      syncSelection(null)
      return
    }

    const keep = selectedPromptId ? list.find((item) => item.id === selectedPromptId) : null
    syncSelection(keep ?? list[0])
  }

  useEffect(() => {
    if (!hasElectronApi) {
      setLoading(false)
      setError('当前不是 Electron 环境，无法访问本地 SQLite。')
      return
    }

    const boot = async () => {
      try {
        setLoading(true)
        const [info] = await Promise.all([window.electronAPI.db.getInfo(), refreshPrompts()])
        setDbInfo(info)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载本地数据库失败')
      } finally {
        setLoading(false)
      }
    }

    void boot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasElectronApi])

  const handleCreatePrompt = async () => {
    if (!hasElectronApi) return
    try {
      setError('')
      const created = await window.electronAPI.prompts.create({
        name: newName.trim() || '未命名提示词',
        content: newContent,
        tags: toTags(newTags),
      })

      setPrompts((current) => [created, ...current])
      syncSelection(created)
      setNewName('')
      setNewContent('')
      setNewTags('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建提示词失败')
    }
  }

  const handleSavePrompt = async () => {
    if (!hasElectronApi || !selectedPrompt) return

    try {
      setError('')
      const updated = await window.electronAPI.prompts.update(selectedPrompt.id, {
        name: editName.trim(),
        content: editContent,
        tags: toTags(editTags),
      })

      if (!updated) return

      setPrompts((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => b.updatedAt - a.updatedAt),
      )
      syncSelection(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存提示词失败')
    }
  }

  const handleDeletePrompt = async (id: number) => {
    if (!hasElectronApi) return

    try {
      setError('')
      const ok = await window.electronAPI.prompts.delete(id)
      if (!ok) return

      const next = prompts.filter((item) => item.id !== id)
      setPrompts(next)
      syncSelection(next[0] ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除提示词失败')
    }
  }

  if (loading) {
    return (
      <section className="fade-up app-panel p-6 md:p-7">
        <p className="surface-subtitle">正在加载本地 SQLite 数据...</p>
      </section>
    )
  }

  return (
    <section className="fade-up grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
      <div className="app-panel p-5 md:p-6">
        <h1 className="surface-title">提示词管理</h1>
        <p className="mt-2 surface-subtitle">这里的数据来自本地 SQLite（Drizzle ORM）。</p>
        {dbInfo ? (
          <div className="mt-3 rounded-xl border border-[#323a47] bg-[#141a24] px-3 py-2 text-xs text-slate-300">
            <p>DB: {dbInfo.dbFilePath}</p>
            <p className="mt-1">作品目录: {dbInfo.worksDir}</p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="新提示词名称"
            className="input-dark"
          />
          <textarea
            rows={4}
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
            placeholder="输入提示词内容"
            className="input-dark resize-y py-3"
          />
          <input
            value={newTags}
            onChange={(event) => setNewTags(event.target.value)}
            placeholder="标签（逗号分隔）"
            className="input-dark"
          />
          <button
            type="button"
            onClick={() => void handleCreatePrompt()}
            className="rounded-xl border border-[#4a5260] bg-[#1b212b] px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:border-[#60697a] hover:bg-[#252d3a]"
          >
            新增提示词
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => syncSelection(prompt)}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                prompt.id === selectedPromptId
                  ? 'border-[#4d5768] bg-[#2a313f]'
                  : 'border-[#323a47] bg-[#141a24] hover:border-[#425170]'
              }`}
            >
              <p className="text-sm font-medium text-slate-100">{prompt.name}</p>
              <p className="mt-1 text-xs text-slate-400">更新于 {formatTime(prompt.updatedAt)}</p>
            </button>
          ))}
          {prompts.length === 0 ? <p className="text-xs text-slate-500">还没有提示词。</p> : null}
        </div>
      </div>

      <div className="app-panel p-5 md:p-6">
        <h2 className="surface-title text-lg">编辑提示词</h2>
        {!selectedPrompt ? (
          <p className="mt-2 surface-subtitle">请选择左侧一个提示词进行编辑。</p>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                className="input-dark"
              />
              <textarea
                rows={10}
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                className="input-dark resize-y py-3"
              />
              <input
                value={editTags}
                onChange={(event) => setEditTags(event.target.value)}
                className="input-dark"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void handleSavePrompt()}
                className="rounded-xl border border-[#4a5260] bg-[#1b212b] px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:border-[#60697a] hover:bg-[#252d3a]"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => void handleDeletePrompt(selectedPrompt.id)}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                删除
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
