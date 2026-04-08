import { Navigate, Route, Routes } from 'react-router-dom'
import { Sidebar, type MenuItem } from './components/Sidebar'

const menuItems: MenuItem[] = [
  { to: '/new-work', label: '新作品', note: '创建一个新的作品' },
  { to: '/works', label: '作品列表', note: '查看和管理已有作品' },
  { to: '/settings', label: '设置', note: '应用偏好和账户配置' },
]

function NewWorkPage() {
  return (
    <PageCard
      title="新作品"
      description="在这里可以快速创建你的新作品，定义名称、标签和初始内容。"
    />
  )
}

function WorksPage() {
  return (
    <PageCard
      title="作品列表"
      description="这里会展示你的所有作品，支持搜索、筛选与状态管理。"
    />
  )
}

function SettingsPage() {
  return (
    <PageCard
      title="设置"
      description="在这里配置主题、默认路径、同步策略和其他应用偏好。"
    />
  )
}

function PageCard({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 text-slate-600">{description}</p>
    </section>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Sidebar items={menuItems} />
      <main className="flex-1 p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/new-work" replace />} />
          <Route path="/new-work" element={<NewWorkPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
