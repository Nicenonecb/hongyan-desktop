import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type WorkEditorPageProps = {
  works: WorkRecord[]
  loadWorkById: (id: number) => Promise<WorkRecord | null>
  onHydrateWork: (work: WorkRecord) => void
}

type ChapterItem = {
  id: string
  title: string
  content: string
  words: number
}

type LibraryGroupId = 'characters' | 'outline' | 'golden-finger'

type LibraryGroup = {
  id: LibraryGroupId
  name: string
  items: string[]
}

const defaultLibraryFolderState: Record<LibraryGroupId, boolean> = {
  characters: true,
  outline: true,
  'golden-finger': true,
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

function summarizeTitle(text: string, fallback: string, max = 18) {
  const firstLine = text
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) return fallback
  if (firstLine.length <= max) return firstLine
  return `${firstLine.slice(0, max)}...`
}

function normalizeChapters(work: WorkRecord): ChapterItem[] {
  const source = work.chapters.length > 0 ? work.chapters : [work.message]

  return source.map((rawContent, index) => {
    const content = String(rawContent ?? '').trim()
    const chapterNo = index + 1
    const fallbackTitle = `第${chapterNo}章`
    const title = summarizeTitle(content, fallbackTitle)

    return {
      id: `${work.id}-chapter-${chapterNo}`,
      title: `第${chapterNo}章 ${title}`,
      content,
      words: content.length,
    }
  })
}

function buildLibraryGroups(work: WorkRecord): LibraryGroup[] {
  return [
    { id: 'characters', name: '人设', items: work.characters },
    { id: 'outline', name: '大纲', items: work.outline },
    { id: 'golden-finger', name: '金手指', items: work.lore.length > 0 ? work.lore : work.library },
  ]
}

function ToolButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-md border border-transparent bg-transparent px-2.5 py-1 text-sm text-slate-300 transition hover:border-[#4a5362] hover:bg-[#232b38] hover:text-slate-100"
    >
      {label}
    </button>
  )
}

export function WorkEditorPage({ works, loadWorkById, onHydrateWork }: WorkEditorPageProps) {
  const { workId } = useParams()
  const numericWorkId = Number(workId)

  const seededWork = useMemo(
    () => works.find((item) => item.id === numericWorkId) ?? null,
    [works, numericWorkId],
  )

  const [work, setWork] = useState<WorkRecord | null>(seededWork)
  const [loading, setLoading] = useState(true)
  const [hydratedAt, setHydratedAt] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0)
  const [draftText, setDraftText] = useState('')
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryGroups, setLibraryGroups] = useState<LibraryGroup[]>([])
  const [openLibraryFolders, setOpenLibraryFolders] = useState(defaultLibraryFolderState)

  useEffect(() => {
    setWork(seededWork)
  }, [seededWork])

  useEffect(() => {
    if (!Number.isFinite(numericWorkId) || numericWorkId <= 0) {
      setLoading(false)
      setError('作品 ID 无效')
      return
    }

    let cancelled = false

    const boot = async () => {
      setLoading(true)
      setError('')

      try {
        const loaded = await loadWorkById(numericWorkId)
        if (cancelled) return

        if (!loaded) {
          setError('未找到该作品')
          setWork(null)
          return
        }

        setWork(loaded)
        onHydrateWork(loaded)
        setHydratedAt(Date.now())
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '加载作品失败')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void boot()

    return () => {
      cancelled = true
    }
  }, [loadWorkById, numericWorkId, onHydrateWork])

  const chapters = useMemo(() => (work ? normalizeChapters(work) : []), [work])
  const activeChapter = chapters[selectedChapterIndex] ?? null

  useEffect(() => {
    setSelectedChapterIndex(0)
  }, [work?.id])

  useEffect(() => {
    if (!work) {
      setLibraryGroups([])
      setLibraryOpen(false)
      setOpenLibraryFolders(defaultLibraryFolderState)
      return
    }

    setLibraryGroups(buildLibraryGroups(work))
    setLibraryOpen(false)
    setOpenLibraryFolders(defaultLibraryFolderState)
  }, [work?.id])

  useEffect(() => {
    if (selectedChapterIndex <= chapters.length - 1) return
    setSelectedChapterIndex(Math.max(0, chapters.length - 1))
  }, [chapters.length, selectedChapterIndex])

  useEffect(() => {
    const nextText = activeChapter?.content ?? work?.message ?? ''
    setDraftText(nextText)
  }, [activeChapter?.id, work?.message])

  const handleCreateLibraryItem = (groupId: LibraryGroupId) => {
    const group = libraryGroups.find((entry) => entry.id === groupId)
    if (!group) return

    const nextName = window.prompt(
      `在「${group.name}」中新建文件`,
      `${group.name}${group.items.length + 1}`,
    )
    const normalized = String(nextName ?? '').trim()
    if (!normalized) return

    setLibraryGroups((current) =>
      current.map((entry) =>
        entry.id === groupId ? { ...entry, items: [...entry.items, normalized] } : entry,
      ),
    )
  }

  const toggleLibraryFolder = (groupId: LibraryGroupId) => {
    setOpenLibraryFolders((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }))
  }

  if (loading && !work) {
    return (
      <section className="fade-up app-panel p-6 md:p-7">
        <p className="surface-subtitle">正在初始化编辑器数据...</p>
      </section>
    )
  }

  if (!work) {
    return (
      <section className="fade-up app-panel p-6 md:p-7">
        <h1 className="surface-title">无法打开作品</h1>
        <p className="mt-2 surface-subtitle">{error || '该作品不存在或已被删除。'}</p>
        <Link
          to="/new-work"
          className="mt-4 inline-flex rounded-xl border border-[#4a5260] bg-[#1b212b] px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:border-[#60697a] hover:bg-[#252d3a]"
        >
          返回新建作品
        </Link>
      </section>
    )
  }

  return (
    <section className="fade-up h-full min-h-[560px] overflow-hidden bg-[#0f141c] text-slate-100">
      <div className="flex h-full min-h-0 flex-col border border-[#2d3440] bg-[#121822]">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d3440] bg-[#171d27] px-3 py-2">
          <div className="flex flex-wrap items-center gap-1">
            {['字体', '背景', '撤销', '重做', '一键排版', '插入'].map((label) => (
              <ToolButton key={label} label={label} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {['全屏', '查找替换', '取名', '历史'].map((label) => (
              <ToolButton key={label} label={label} />
            ))}
            <button
              type="button"
              className="rounded-md border border-[#4a5260] bg-[#1b212b] px-3 py-1 text-sm text-slate-100 transition hover:border-[#60697a] hover:bg-[#252d3a]"
            >
              发布到稿箱
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-72 shrink-0 flex-col border-r border-[#2d3440] bg-[#151c27] p-3">
            <input
              type="text"
              placeholder="全书搜索"
              className="w-full rounded-md border border-[#3b4455] bg-[#111823] px-2.5 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#596274]"
            />

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-[#4a5260] bg-[#1b212b] px-2 py-1.5 text-sm text-slate-100 transition hover:border-[#60697a] hover:bg-[#252d3a]"
              >
                新建章
              </button>
              <button
                type="button"
                className="rounded-md border border-[#4a5260] bg-[#1b212b] px-2 py-1.5 text-sm text-slate-100 transition hover:border-[#60697a] hover:bg-[#252d3a]"
              >
                新建卷
              </button>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
              <section className="rounded-lg border border-[#333c4b] bg-[#1a2330]">
                <button
                  type="button"
                  onClick={() => setLibraryOpen((current) => !current)}
                  className="flex w-full items-center justify-between px-2.5 py-2 text-left"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#45506a] bg-[#222c3d] text-slate-300">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor">
                        <path d="M3 7h7l2 2h9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" strokeWidth="1.8" />
                      </svg>
                    </span>
                    资料库
                  </span>
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#4f5a71] bg-[#1c2635] text-slate-300"
                    title={libraryOpen ? '收起资料库' : '展开资料库'}
                    aria-label={libraryOpen ? '收起资料库' : '展开资料库'}
                  >
                    {libraryOpen ? '▾' : '▸'}
                  </span>
                </button>

                {libraryOpen ? (
                  <div className="space-y-2 border-t border-[#333c4b] p-2">
                    {libraryGroups.map((group) => (
                      <section
                        key={group.id}
                        className="overflow-hidden rounded-lg border border-[#3b4558] bg-[#131c29]"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-[#2f394b] px-2.5 py-2">
                          <button
                            type="button"
                            onClick={() => toggleLibraryFolder(group.id)}
                            className="flex min-w-0 flex-1 items-center text-left"
                          >
                            <span className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-100">{group.name}</p>
                            </span>
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCreateLibraryItem(group.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#4f5a71] bg-[#1c2635] text-slate-100 transition hover:border-[#6a7690] hover:bg-[#273245]"
                              title={`在${group.name}中新建文件`}
                              aria-label={`在${group.name}中新建文件`}
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor">
                                <path d="M12 5v14M5 12h14" strokeWidth="1.9" strokeLinecap="round" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleLibraryFolder(group.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#4f5a71] bg-[#1c2635] text-slate-300 transition hover:border-[#6a7690] hover:bg-[#273245] hover:text-slate-100"
                              title={openLibraryFolders[group.id] ? `收起${group.name}` : `展开${group.name}`}
                              aria-label={openLibraryFolders[group.id] ? `收起${group.name}` : `展开${group.name}`}
                            >
                              {openLibraryFolders[group.id] ? '▾' : '▸'}
                            </button>
                          </div>
                        </div>

                        {openLibraryFolders[group.id] ? (
                          group.items.length === 0 ? (
                            <div className="flex items-center justify-center px-2.5 py-3 text-slate-500">
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                                <path d="M7 3h7l5 5v13H7z" strokeWidth="1.7" />
                                <path d="M14 3v5h5" strokeWidth="1.7" />
                              </svg>
                            </div>
                          ) : (
                            <ul className="space-y-1 p-2 text-xs">
                              {group.items.map((item, index) => (
                                <li
                                  key={`${group.id}-${index}-${item}`}
                                  className="flex items-center gap-2 rounded-md border border-[#374357] bg-[#1a2534] px-2 py-1.5 text-slate-200"
                                >
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[#243147] text-slate-300">
                                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor">
                                      <path d="M7 3h7l5 5v13H7z" strokeWidth="1.7" />
                                      <path d="M14 3v5h5" strokeWidth="1.7" />
                                    </svg>
                                  </span>
                                  <span className="truncate">{item}</span>
                                </li>
                              ))}
                            </ul>
                          )
                        ) : null}
                      </section>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="mt-3 rounded-lg border border-[#333c4b] bg-[#1a2330]">
                <p className="px-2.5 pt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  章节列表
                </p>
                <div className="mt-2 space-y-1 px-2 pb-2">
                  {chapters.map((chapter, index) => {
                    const active = index === selectedChapterIndex
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => setSelectedChapterIndex(index)}
                        className={[
                          'w-full rounded-md border px-2.5 py-2 text-left transition',
                          active
                            ? 'border-[#4d5768] bg-[#2a313f] text-slate-100'
                            : 'border-transparent bg-[#121a25] text-slate-300 hover:border-[#4a5468] hover:bg-[#222b39]',
                        ].join(' ')}
                      >
                        <p className="truncate text-sm font-medium">{chapter.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{chapter.words} 字</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col bg-[#111823]">
            <div className="flex items-center justify-between border-b border-[#2d3440] px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{work.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {activeChapter?.title ?? '正文'} · 分类：{work.category}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {hydratedAt ? `同步于 ${formatTime(hydratedAt)}` : `更新于 ${formatTime(work.updatedAt)}`}
              </p>
            </div>
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              placeholder="开始写作..."
              className="min-h-0 flex-1 resize-none border-none bg-transparent px-6 py-5 text-base leading-8 text-slate-100 outline-none placeholder:text-slate-500"
            />
            <div className="flex items-center justify-between border-t border-[#2d3440] px-5 py-2 text-xs text-slate-500">
              <span>当前字数：{draftText.length}</span>
              <span>章节字数：{activeChapter?.words ?? 0}</span>
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
