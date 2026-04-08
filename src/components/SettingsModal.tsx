import { useEffect, useMemo, useState, type ReactNode } from 'react'

type SettingsModalProps = {
  open: boolean
  onClose: () => void
}

type SectionId = 'personalization' | 'model' | 'storage'

type Section = {
  id: SectionId
  label: string
}

const sections: Section[] = [
  { id: 'personalization', label: '个性化' },
  { id: 'model', label: '模型接入' },
  { id: 'storage', label: '存储位置' },
]

const inputClass =
  'w-full rounded-xl border border-[#363f4d] bg-[#141923] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25'

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('personalization')

  const sectionTitle = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label ?? '设置',
    [activeSection],
  )

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="fade-up flex h-[min(700px,94vh)] w-full max-w-5xl overflow-hidden rounded-2xl border border-[#2f3743] bg-[#12161e] shadow-[0_35px_90px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="w-64 border-r border-[#2d3441] bg-[#171c18] p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Preferences
          </p>
          <p className="mt-2 px-2 text-lg font-semibold text-slate-100">设置中心</p>
          <nav className="mt-6 grid gap-1">
            {sections.map((section) => {
              const active = section.id === activeSection
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={[
                    'rounded-lg border px-3 py-2 text-left text-sm transition',
                    active
                      ? 'border-blue-400/45 bg-blue-500/15 text-blue-100'
                      : 'border-transparent text-slate-300 hover:border-[#364151] hover:bg-[#232a35] hover:text-slate-100',
                  ].join(' ')}
                >
                  {section.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="flex flex-1 flex-col bg-[#12161e]">
          <header className="border-b border-[#2d3441] px-6 py-4 md:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-100">{sectionTitle}</h2>
                <p className="mt-1 text-sm text-slate-400">与桌面端工作流保持一致的配置选项。</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#37404d] bg-[#1a202a] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[#232a35] hover:text-slate-100"
              >
                关闭
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
            {activeSection === 'personalization' && <PersonalizationPanel />}
            {activeSection === 'model' && <ModelPanel />}
            {activeSection === 'storage' && <StoragePanel />}
          </div>

          <footer className="flex justify-end gap-2 border-t border-[#2d3441] px-6 py-3 md:px-8">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#37404d] bg-[#1a202a] px-3.5 py-2 text-sm text-slate-300 transition hover:bg-[#232a35]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              保存设置
            </button>
          </footer>
        </section>
      </div>
    </div>
  )
}

function PersonalizationPanel() {
  return (
    <div className="space-y-5">
      <Field label="语言偏好" hint="影响界面语言和文案风格。">
        <select className={inputClass}>
          <option>简体中文</option>
          <option>English</option>
        </select>
      </Field>
      <Field label="默认主题" hint="当前以黑夜风作为主主题。">
        <div className="inline-flex rounded-xl border border-[#363f4d] bg-[#141923] p-1 text-sm">
          <Choice>黑夜</Choice>
          <Choice>跟随系统</Choice>
        </div>
      </Field>
    </div>
  )
}

function ModelPanel() {
  const [modelIds, setModelIds] = useState<string[]>([''])
  const [defaultModelId, setDefaultModelId] = useState('')

  const updateModelId = (index: number, value: string) => {
    setModelIds((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    )
  }

  const addModelId = () => {
    setModelIds((current) => [...current, ''])
  }

  const removeModelId = (index: number) => {
    setModelIds((current) => {
      if (current.length === 1) return current
      return current.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  return (
    <div className="space-y-5">
      <Field label="API 地址" hint="例如 OpenAI 或内部模型网关地址。">
        <input type="text" placeholder="https://api.example.com/v1" className={inputClass} />
      </Field>
      <Field label="API Key" hint="仅保存在本地设备。">
        <input type="password" placeholder="sk-..." className={inputClass} />
      </Field>
      <Field label="模型 ID 列表" hint="手动输入模型 ID，可配置多个。">
        <div className="space-y-2.5">
          {modelIds.map((modelId, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={modelId}
                onChange={(event) => updateModelId(index, event.target.value)}
                placeholder={`model-id-${index + 1}`}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeModelId(index)}
                disabled={modelIds.length === 1}
                className="rounded-xl border border-[#37414f] bg-[#1a202a] px-3 py-2 text-sm text-slate-300 transition hover:bg-[#232a35] disabled:cursor-not-allowed disabled:opacity-40"
              >
                删除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addModelId}
            className="rounded-xl border border-[#37414f] bg-[#1a202a] px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-[#232a35]"
          >
            + 新增模型 ID
          </button>
        </div>
      </Field>
      <Field label="默认模型 ID" hint="新会话默认使用的模型 ID。">
        <input
          type="text"
          value={defaultModelId}
          onChange={(event) => setDefaultModelId(event.target.value)}
          placeholder="请输入默认模型 ID"
          className={inputClass}
        />
      </Field>
    </div>
  )
}

function StoragePanel() {
  return (
    <div className="space-y-5">
      <Field label="作品存储目录" hint="默认用于保存项目和导出文件。">
        <div className="flex gap-2">
          <input type="text" defaultValue="~/Documents/Hongyan" className={inputClass} />
          <button
            type="button"
            className="rounded-xl border border-[#37414f] bg-[#1a202a] px-3.5 py-2 text-sm text-slate-200 transition hover:bg-[#232a35]"
          >
            浏览
          </button>
        </div>
      </Field>
      <Field label="自动备份" hint="定期保存历史版本，防止误删。">
        <div className="inline-flex rounded-xl border border-[#363f4d] bg-[#141923] p-1 text-sm">
          <Choice>关闭</Choice>
          <Choice>每天</Choice>
          <Choice>每周</Choice>
        </div>
      </Field>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <p className="text-sm font-semibold text-slate-100">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function Choice({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:bg-[#232a35] hover:text-slate-100"
    >
      {children}
    </button>
  )
}
