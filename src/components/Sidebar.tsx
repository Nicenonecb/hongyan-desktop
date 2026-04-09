import { NavLink } from 'react-router-dom'

export type MenuItem = {
  to: string
  label: string
}

type SidebarProps = {
  items: MenuItem[]
  works: WorkRecord[]
  worksLoading: boolean
  onOpenSettings: () => void
}

export function Sidebar({
  items,
  works,
  worksLoading,
  onOpenSettings,
}: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-xl border px-4 py-3 transition-all',
      isActive
        ? 'border-[#4d5768] bg-[#2a313f] text-slate-100 shadow-[0_0_0_1px_rgba(120,132,153,0.22)]'
        : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-[#2b313c] hover:text-slate-100',
    ].join(' ')

  return (
    <aside
      className="fade-up flex w-full flex-col border-b border-[#313934] p-4 md:h-full md:w-72 md:border-b-0 md:border-r md:p-5"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <nav className="grid content-start gap-2">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <p className="text-sm font-semibold">{item.label}</p>
          </NavLink>
        ))}
      </nav>

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <p className="px-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-400">作品列表</p>
        <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {worksLoading ? <p className="text-xs text-slate-500">正在同步作品...</p> : null}
          {!worksLoading && works.length === 0 ? (
            <p className="text-xs text-slate-500">还没有作品，先创建一个吧。</p>
          ) : null}
          {works.map((work) => (
            <NavLink
              key={work.id}
              to={`/work/${work.id}`}
              className={({ isActive }) =>
                [
                  'block rounded-lg border px-2.5 py-2 text-xs transition',
                  isActive
                    ? 'border-[#4d5768] bg-[#2a313f]'
                    : 'border-transparent bg-[#171d27] hover:border-[#465369] hover:bg-[#1c2431]',
                ].join(' ')
              }
            >
              <p className="truncate text-sm font-medium text-slate-100">{work.title}</p>
            </NavLink>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenSettings}
        className="mt-4 rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-[#596274] hover:bg-[#2b313d]"
        style={{ borderColor: '#3c4553', background: '#242b35' }}
      >
        设置
      </button>
    </aside>
  )
}
