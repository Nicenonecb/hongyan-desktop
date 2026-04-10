import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar, type MenuItem } from './components/Sidebar'
import { SettingsModal } from './components/SettingsModal'
import { NewWorkComposer } from './components/NewWorkComposer'
import { PromptManager } from './components/PromptManager'
import { WorkEditorPage } from './components/WorkEditorPage'

const menuItems: MenuItem[] = [
  { to: '/new-work', label: '新作品' },
  { to: '/works', label: '作品列表' },
  { to: '/prompts', label: '提示词管理' },
]

function sortWorksByUpdatedAt(works: WorkRecord[]) {
  return [...works].sort((a, b) => b.updatedAt - a.updatedAt)
}

function inferWorkTitle(input: WorkInput, now: number) {
  const cleanTitle = String(input.title ?? '').trim()
  if (cleanTitle) return cleanTitle

  const firstLine = input.message
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  if (firstLine) return firstLine.slice(0, 24)

  return `新作品 ${new Date(now).toLocaleTimeString('zh-CN', { hour12: false })}`
}

function buildOptimisticWork(input: WorkInput, id: number) {
  const now = Date.now()
  return {
    id,
    title: inferWorkTitle(input, now),
    category: input.category,
    message: input.message,
    attachments: input.attachments,
    chapters: [],
    library: input.attachments,
    characters: [],
    lore: [],
    outline: input.message ? [input.message] : [],
    createdAt: now,
    updatedAt: now,
  }
}

type NewWorkPageProps = {
  creating: boolean
  createError: string
  onCreateWork: (input: WorkInput) => Promise<WorkRecord>
}

function NewWorkPage({ creating, createError, onCreateWork }: NewWorkPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleCreateWork = async (input: WorkInput) => {
    setError('')

    try {
      const created = await onCreateWork(input)
      navigate(`/work/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建作品失败')
    }
  }

  return (
    <section className="fade-up absolute bottom-[25px] left-0 right-0 px-2 md:px-3">
      <NewWorkComposer creating={creating} onCreateWork={handleCreateWork} />
      {error || createError ? (
        <p className="mx-auto mt-3 w-full max-w-4xl rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error || createError}
        </p>
      ) : null}
    </section>
  )
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

type WorksPageProps = {
  works: WorkRecord[]
  loading: boolean
}

function WorksPage({ works, loading }: WorksPageProps) {
  return (
    <section className="fade-up app-panel p-6 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="surface-title">作品列表</h1>
          <p className="mt-2 surface-subtitle">
            {loading ? '正在同步本地作品...' : `共 ${works.length} 部作品`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/new-work"
            className="rounded-xl border border-[#4a5260] bg-[#1b212b] px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:border-[#60697a] hover:bg-[#252d3a]"
          >
            新建作品
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#323a47]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#1d2330] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">名称</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">最后更新</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work.id} className="border-t border-[#2d3441] bg-[#151a22]">
                <td className="px-4 py-3 font-medium text-slate-100">
                  <Link to={`/work/${work.id}`} className="transition hover:text-slate-200">
                    {work.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{work.category}</td>
                <td className="px-4 py-3 text-slate-400">{formatTime(work.updatedAt)}</td>
              </tr>
            ))}
            {!loading && works.length === 0 ? (
              <tr className="border-t border-[#2d3441] bg-[#151a22]">
                <td className="px-4 py-4 text-slate-500" colSpan={3}>
                  还没有作品，去新建一个开始创作吧。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PromptsPage() {
  return <PromptManager />
}

function parseWorkIdFromPath(pathname: string) {
  const match = /^\/work\/(\d+)$/.exec(pathname)
  if (!match) return null
  const workId = Number(match[1])
  if (!Number.isFinite(workId) || workId <= 0) return null
  return workId
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [works, setWorks] = useState<WorkRecord[]>([])
  const [worksLoading, setWorksLoading] = useState(true)
  const [creatingWork, setCreatingWork] = useState(false)
  const [createError, setCreateError] = useState('')
  const [openWorkTabs, setOpenWorkTabs] = useState<number[]>([])
  const worksRef = useRef<WorkRecord[]>([])

  const hasWorksApi = typeof window !== 'undefined' && !!window.electronAPI?.works

  const revalidateWorks = useCallback(async () => {
    if (!hasWorksApi) {
      setWorksLoading(false)
      return []
    }

    const list = await window.electronAPI.works.list()
    const sorted = sortWorksByUpdatedAt(list)
    setWorks(sorted)
    return sorted
  }, [hasWorksApi])

  useEffect(() => {
    worksRef.current = works
  }, [works])

  useEffect(() => {
    if (!hasWorksApi) {
      setWorksLoading(false)
      return
    }

    const boot = async () => {
      try {
        setWorksLoading(true)
        await revalidateWorks()
      } finally {
        setWorksLoading(false)
      }
    }

    void boot()
  }, [hasWorksApi, revalidateWorks])

  const handleCreateWork = useCallback(
    async (input: WorkInput) => {
      setCreateError('')

      const optimisticId = -Date.now()
      const optimisticWork = buildOptimisticWork(input, optimisticId)

      setWorks((current) => sortWorksByUpdatedAt([optimisticWork, ...current]))
      setCreatingWork(true)

      try {
        if (!hasWorksApi) {
          const localWork = { ...optimisticWork, id: Date.now() }
          setWorks((current) =>
            sortWorksByUpdatedAt([
              localWork,
              ...current.filter((item) => item.id !== optimisticId && item.id !== localWork.id),
            ]),
          )
          return localWork
        }

        const created = await window.electronAPI.works.insert(input)
        setWorks((current) =>
          sortWorksByUpdatedAt([
            created,
            ...current.filter((item) => item.id !== optimisticId && item.id !== created.id),
          ]),
        )

        void revalidateWorks()
        return created
      } catch (err) {
        setWorks((current) => current.filter((item) => item.id !== optimisticId))
        const message = err instanceof Error ? err.message : '创建作品失败'
        setCreateError(message)
        throw err
      } finally {
        setCreatingWork(false)
      }
    },
    [hasWorksApi, revalidateWorks],
  )

  const loadWorkById = useCallback(
    async (id: number) => {
      if (!hasWorksApi) {
        return worksRef.current.find((item) => item.id === id) ?? null
      }

      return window.electronAPI.works.getById(id)
    },
    [hasWorksApi],
  )

  const hydrateWork = useCallback((work: WorkRecord) => {
    setWorks((current) =>
      sortWorksByUpdatedAt([work, ...current.filter((item) => item.id !== work.id)]),
    )
  }, [])

  const activeWorkId = parseWorkIdFromPath(location.pathname)
  const homeTabActive = activeWorkId === null
  const showShellSidebar = activeWorkId === null

  useEffect(() => {
    if (!activeWorkId) return
    setOpenWorkTabs((current) =>
      current.includes(activeWorkId) ? current : [...current, activeWorkId],
    )
  }, [activeWorkId])

  const getWorkTabTitle = useCallback(
    (workId: number) => works.find((item) => item.id === workId)?.title ?? `作品 #${workId}`,
    [works],
  )

  const handleCloseWorkTab = useCallback(
    (workId: number) => {
      setOpenWorkTabs((current) => {
        const nextTabs = current.filter((id) => id !== workId)
        if (activeWorkId === workId) {
          const fallbackId = nextTabs[nextTabs.length - 1]
          navigate(fallbackId ? `/work/${fallbackId}` : '/new-work')
        }
        return nextTabs
      })
    },
    [activeWorkId, navigate],
  )

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--app-bg)' }}>
      <header className="titlebar-drag flex h-11 items-end border-b border-[#2d3440] bg-[#171d27] px-3 pb-1.5 md:pl-[92px] md:pr-4">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('/new-work')}
            className={[
              'titlebar-no-drag inline-flex h-8 items-center gap-2 rounded-t-md border px-3 text-sm transition',
              homeTabActive
                ? 'border-[#4d5768] bg-[#2a313f] text-slate-100'
                : 'border-[#3d4656] bg-[#202733] text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            <span className="inline-block h-3.5 w-3.5 rounded bg-slate-400" />
            <span className="truncate">红颜写作</span>
          </button>
          {openWorkTabs.map((workId) => {
            const active = activeWorkId === workId
            return (
              <button
                key={workId}
                type="button"
                onClick={() => navigate(`/work/${workId}`)}
                className={[
                  'titlebar-no-drag inline-flex h-8 max-w-[260px] items-center gap-2 rounded-t-md border px-3 text-sm transition',
                  active
                    ? 'border-[#4d5768] bg-[#2a313f] text-slate-100'
                    : 'border-[#3d4656] bg-[#202733] text-slate-400 hover:text-slate-200',
                ].join(' ')}
              >
                <span className="truncate">{getWorkTabTitle(workId)}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleCloseWorkTab(workId)
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    event.stopPropagation()
                    handleCloseWorkTab(workId)
                  }}
                  className="rounded px-1 text-slate-400 transition hover:bg-[#313a4a] hover:text-slate-200"
                >
                  ×
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <div
        className={[
          'flex min-h-0 flex-1 flex-col',
          showShellSidebar ? 'md:flex-row md:overflow-hidden' : 'overflow-hidden',
        ].join(' ')}
      >
        {showShellSidebar ? (
          <Sidebar
            items={menuItems}
            works={works}
            worksLoading={worksLoading}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        ) : null}

        <main
          className={[
            'relative min-h-0 flex-1 md:h-full',
            showShellSidebar ? 'p-4 md:overflow-y-auto md:p-6' : 'overflow-hidden p-0',
          ].join(' ')}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/new-work" replace />} />
            <Route
              path="/new-work"
              element={
                <NewWorkPage
                  creating={creatingWork}
                  createError={createError}
                  onCreateWork={handleCreateWork}
                />
              }
            />
            <Route path="/works" element={<WorksPage works={works} loading={worksLoading} />} />
            <Route
              path="/work/:workId"
              element={
                <WorkEditorPage
                  works={works}
                  loadWorkById={loadWorkById}
                  onHydrateWork={hydrateWork}
                />
              }
            />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/settings" element={<Navigate to="/new-work" replace />} />
          </Routes>
        </main>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default App
