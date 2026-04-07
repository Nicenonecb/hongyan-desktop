import { NavLink, Route, Routes } from 'react-router-dom'

function HomePage() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Electron + React + TypeScript
      </h1>
      <p className="mt-3 text-slate-600">
        你现在的桌面应用基础架构已经就位，并且已集成 Tailwind 与 React
        Router。
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Renderer" value="React + Vite" />
        <StatCard label="Routing" value="React Router" />
        <StatCard label="Style" value="Tailwind CSS" />
      </div>
    </section>
  )
}

function AboutPage() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-2xl font-semibold text-slate-900">关于项目</h2>
      <p className="mt-3 text-slate-600">
        当前采用 Electron 主进程 + React 渲染进程架构，开发模式下由 Vite
        提供热更新，路由使用 Hash 模式以兼容桌面打包后的静态文件访问。
      </p>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-medium text-slate-900">{value}</div>
    </div>
  )
}

function App() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-lg px-4 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900',
    ].join(' ')

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-900">Hongyan Desktop</span>
        <nav className="flex gap-2 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200">
          <NavLink to="/" end className={linkClass}>
            首页
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            关于
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </main>
  )
}

export default App
