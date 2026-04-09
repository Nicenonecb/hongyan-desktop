import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type WorkEditorPageProps = {
  works: WorkRecord[]
  loadWorkById: (id: number) => Promise<WorkRecord | null>
  onHydrateWork: (work: WorkRecord) => void
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

function DataGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-[#31394a] bg-[#141a24] p-4">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">共 {items.length} 条</p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">暂无数据</p>
      ) : (
        <ul className="mt-2 space-y-1 text-xs text-slate-300">
          {items.map((item, index) => (
            <li key={`${title}-${index}-${item}`} className="rounded-md bg-[#1a2130] px-2 py-1">
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
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
    <section className="fade-up grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
      <div className="app-panel p-5 md:p-6">
        <h1 className="surface-title">{work.title}</h1>
        <p className="mt-2 surface-subtitle">
          分类：{work.category} · 最近更新：{formatTime(work.updatedAt)}
        </p>
        <div className="mt-3 rounded-xl border border-[#31394a] bg-[#141a24] px-3 py-2 text-xs text-slate-300">
          <p>workId: {work.id}</p>
          <p className="mt-1">Hydration: {hydratedAt ? `完成于 ${formatTime(hydratedAt)}` : '进行中'}</p>
        </div>

        <div className="mt-4 rounded-xl border border-[#31394a] bg-[#141a24] p-4">
          <h2 className="text-sm font-semibold text-slate-100">创作输入</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {work.message || '暂无创作指令'}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <DataGroup title="chapters" items={work.chapters} />
        <DataGroup title="library" items={work.library} />
        <DataGroup title="characters" items={work.characters} />
        <DataGroup title="lore" items={work.lore} />
        <DataGroup title="outline" items={work.outline} />
      </div>
    </section>
  )
}
