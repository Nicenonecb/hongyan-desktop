import { useState, type ChangeEvent, type DragEvent } from 'react'

const categoryOptions = ['都市高武', '都市脑洞', '历史脑洞', '玄幻脑洞']

export function NewWorkComposer() {
  const [category, setCategory] = useState(categoryOptions[0])
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const appendFiles = (incoming: File[]) => {
    setAttachments((prev) => {
      const map = new Map(prev.map((file) => [`${file.name}-${file.size}-${file.lastModified}`, file]))
      incoming.forEach((file) => {
        map.set(`${file.name}-${file.size}-${file.lastModified}`, file)
      })
      return Array.from(map.values())
    })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    appendFiles(Array.from(files))
    event.target.value = ''
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files ?? [])
    if (files.length > 0) appendFiles(files)
  }

  const removeAttachment = (target: File) => {
    setAttachments((prev) =>
      prev.filter(
        (file) =>
          !(
            file.name === target.name &&
            file.size === target.size &&
            file.lastModified === target.lastModified
          ),
      ),
    )
  }

  const canSend = message.trim().length > 0 || attachments.length > 0

  const handleSend = () => {
    if (!canSend) return
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`mx-auto flex w-full max-w-4xl flex-col rounded-[18px] border px-3 py-2.5 md:px-3.5 md:py-3 transition ${
        isDragging
          ? 'border-blue-500 bg-[#212634]'
          : 'border-[#2a2d34] bg-gradient-to-b from-[#222429] to-[#1a1c21]'
      }`}
    >
      <textarea
        id="new-work-message"
        rows={3}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="要求后续变更"
        className="h-[56px] w-full resize-none border-none bg-transparent text-[15px] leading-6 text-slate-100 outline-none placeholder:text-[#5f636b] md:h-[64px] md:text-base"
      />

      {attachments.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#3b4558] bg-[#1b2433] px-3 py-1 text-xs text-slate-200"
            >
              <span className="max-w-[180px] truncate">{file.name}</span>
              <button
                type="button"
                className="text-slate-400 transition hover:text-slate-200"
                onClick={() => removeAttachment(file)}
                aria-label={`移除文件 ${file.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        id="new-work-file-upload"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mt-2 flex items-center gap-1.5 text-[#a0a4ab]">
        <label
          htmlFor="new-work-file-upload"
          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#3a3e46] bg-[#262a31] text-xl leading-none transition hover:bg-[#2d323a]"
          aria-label="上传文件"
        >
          +
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-7 rounded-full border border-[#3a3e46] bg-[#262a31] px-3 text-xs text-slate-200 outline-none transition hover:bg-[#2d323a] focus:border-[#5b6372]"
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c2c5cb] text-[#242830] transition hover:bg-[#d3d6db] disabled:cursor-not-allowed disabled:bg-[#4a4f58] disabled:text-[#7d828d]"
            aria-label="发送"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
              <path d="M12 5v14M6.5 10.5L12 5l5.5 5.5" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
