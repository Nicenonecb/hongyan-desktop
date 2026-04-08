import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Sidebar, type MenuItem } from './components/Sidebar'
import { SettingsModal } from './components/SettingsModal'
import { NewWorkComposer } from './components/NewWorkComposer'

const menuItems: MenuItem[] = [
  { to: '/new-work', label: '新作品', note: '创建一个新的作品' },
  { to: '/works', label: '作品列表', note: '查看和管理已有作品' },
]

function NewWorkPage() {
  return (
    <section className="fade-up absolute bottom-[25px] left-0 right-0 px-2 md:px-3">
      <NewWorkComposer />
    </section>
  )
}

function WorksPage() {
  return (
    <section className="fade-up app-panel p-6 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="surface-title">作品列表</h1>
          <p className="mt-2 surface-subtitle">共 8 部作品，最近一次更新于 5 分钟前。</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-[#3a4351] bg-[#1a202a] px-3.5 py-2 text-sm text-slate-200 transition hover:bg-[#222937]">
            筛选
          </button>
          <button className="rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
            新建作品
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#323a47]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#1d2330] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">名称</th>
              <th className="px-4 py-3 font-medium">进度</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">最后更新</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['旧城夜雨', '12 / 20 章', '写作中', '刚刚'],
              ['鲸落计划', '3 / 18 章', '待完善', '2 小时前'],
              ['玻璃海', '20 / 20 章', '已完结', '昨天'],
            ].map(([name, progress, status, updated]) => (
              <tr key={name} className="border-t border-[#2d3441] bg-[#151a22]">
                <td className="px-4 py-3 font-medium text-slate-100">{name}</td>
                <td className="px-4 py-3 text-slate-300">{progress}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-200">
                    {status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen md:flex" style={{ background: 'var(--app-bg)' }}>
      <Sidebar items={menuItems} onOpenSettings={() => setSettingsOpen(true)} />

      <main className="relative flex-1 p-4 md:p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/new-work" replace />} />
          <Route path="/new-work" element={<NewWorkPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/settings" element={<Navigate to="/new-work" replace />} />
        </Routes>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default App
