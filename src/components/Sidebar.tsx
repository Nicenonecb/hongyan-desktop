import { NavLink } from 'react-router-dom'

export type MenuItem = {
  to: string
  label: string
  note: string
}

type SidebarProps = {
  items: MenuItem[]
  title?: string
  subtitle?: string
}

export function Sidebar({
  items,
  title = 'Hongyan Desktop',
  subtitle = '创作工作台',
}: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-xl px-4 py-3 transition',
      isActive
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ')

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r md:p-6">
      <div>
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      <nav className="mt-5 grid gap-2 md:mt-8">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="mt-1 text-xs opacity-80">{item.note}</p>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
