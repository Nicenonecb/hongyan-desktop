import { NavLink } from 'react-router-dom'

export type MenuItem = {
  to: string
  label: string
  note: string
}

type SidebarProps = {
  items: MenuItem[]
  title?: string
  onOpenSettings: () => void
}

export function Sidebar({
  items,
  title = '红颜写作',
  onOpenSettings,
}: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-xl border px-4 py-3 transition-all',
      isActive
        ? 'border-blue-400/40 bg-blue-500/15 text-slate-100 shadow-[0_0_0_1px_rgba(109,167,255,0.2)]'
        : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-[#2b313c] hover:text-slate-100',
    ].join(' ')

  return (
    <aside
      className="fade-up flex w-full flex-col border-b border-[#313934] p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r md:p-5"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div
        className="rounded-xl border p-4"
        style={{
          background: 'var(--sidebar-bg-soft)',
          borderColor: '#37404c',
        }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">工作区</p>
        <p className="mt-1.5 text-lg font-semibold text-slate-100">{title}</p>
      </div>
      <nav className="mt-5 grid flex-1 content-start gap-2 md:mt-8">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="mt-1 text-xs text-slate-400/90">{item.note}</p>
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={onOpenSettings}
        className="mt-4 rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-blue-500/50 hover:bg-[#2b313d]"
        style={{ borderColor: '#3c4553', background: '#242b35' }}
      >
        设置
      </button>
    </aside>
  )
}
