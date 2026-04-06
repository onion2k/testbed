import type { ReactNode } from 'react'

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(`[^`]+`)/g)

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${part}-${index}`} className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-800">
          {part.slice(1, -1)}
        </code>
      )
    }

    return part
  })
}

export function MarkdownDocument({ markdown, hideFirstHeading = false }: { markdown: string; hideFirstHeading?: boolean }) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  function collectParagraph(startIndex: number) {
    const collected: string[] = []
    let cursor = startIndex

    while (cursor < lines.length) {
      const line = lines[cursor]
      if (!line.trim()) break
      if (/^#{1,6}\s/.test(line) || /^[-*]\s/.test(line) || /^\d+\.\s/.test(line) || /^```/.test(line) || /^\|/.test(line)) break
      collected.push(line.trim())
      cursor += 1
    }

    return {
      text: collected.join(' '),
      nextIndex: cursor,
    }
  }

  function collectList(startIndex: number, ordered: boolean) {
    const items: string[] = []
    let cursor = startIndex
    const pattern = ordered ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/

    while (cursor < lines.length) {
      const match = lines[cursor].match(pattern)
      if (!match) break
      items.push(match[1])
      cursor += 1
    }

    return { items, nextIndex: cursor }
  }

  function collectCodeBlock(startIndex: number) {
    const firstLine = lines[startIndex]
    const language = firstLine.replace(/^```/, '').trim()
    const content: string[] = []
    let cursor = startIndex + 1

    while (cursor < lines.length && !lines[cursor].startsWith('```')) {
      content.push(lines[cursor])
      cursor += 1
    }

    return {
      language,
      code: content.join('\n'),
      nextIndex: cursor + 1,
    }
  }

  function collectTable(startIndex: number) {
    const tableLines: string[] = []
    let cursor = startIndex

    while (cursor < lines.length && lines[cursor].startsWith('|')) {
      tableLines.push(lines[cursor])
      cursor += 1
    }

    const rows = tableLines
      .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
      .filter((row) => row.length > 0)

    const [header, separator, ...body] = rows
    const usableBody = separator?.every((cell) => /^:?-{3,}:?$/.test(cell)) ? body : [separator, ...body].filter(Boolean)

    return {
      header: header ?? [],
      body: usableBody,
      nextIndex: cursor,
    }
  }

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)?.[0].length ?? 1
      const text = line.replace(/^#{1,6}\s+/, '')
      const isFirstBlock = blocks.length === 0
      if (hideFirstHeading && isFirstBlock) {
        index += 1
        continue
      }
      const className =
        {
          1: 'text-4xl font-semibold tracking-tight text-slate-900',
          2: `${isFirstBlock ? '' : 'mt-10 '}text-2xl font-semibold text-slate-900`,
          3: `${isFirstBlock ? '' : 'mt-8 '}text-xl font-semibold text-slate-900`,
          4: `${isFirstBlock ? '' : 'mt-6 '}text-lg font-semibold text-slate-900`,
        }[level] ?? `${isFirstBlock ? '' : 'mt-6 '}text-base font-semibold text-slate-900`

      blocks.push(
        <div key={`heading-${index}`} className={className}>
          {renderInlineMarkdown(text)}
        </div>,
      )
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const block = collectCodeBlock(index)
      blocks.push(
        <pre key={`code-${index}`} className="overflow-x-auto rounded-[1.5rem] bg-slate-950 p-5 text-sm text-slate-100">
          <code>{block.code}</code>
        </pre>,
      )
      index = block.nextIndex
      continue
    }

    if (line.startsWith('|')) {
      const table = collectTable(index)
      blocks.push(
        <div key={`table-${index}`} className="overflow-x-auto rounded-[1.5rem] border border-stone-200 bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-stone-100 text-slate-700">
              <tr>
                {table.header.map((cell, cellIndex) => (
                  <th key={`header-${cellIndex}`} className="border-b border-stone-200 px-4 py-3 font-semibold">
                    {renderInlineMarkdown(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.body.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="border-t border-stone-200">
                  {row.map((cell, cellIndex) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-slate-700">
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      index = table.nextIndex
      continue
    }

    if (/^[-*]\s/.test(line)) {
      const list = collectList(index, false)
      blocks.push(
        <ul key={`ul-${index}`} className="ml-6 list-disc space-y-2 text-slate-700">
          {list.items.map((item, itemIndex) => (
            <li key={`ul-item-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      )
      index = list.nextIndex
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const list = collectList(index, true)
      blocks.push(
        <ol key={`ol-${index}`} className="ml-6 list-decimal space-y-2 text-slate-700">
          {list.items.map((item, itemIndex) => (
            <li key={`ol-item-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>,
      )
      index = list.nextIndex
      continue
    }

    const paragraph = collectParagraph(index)
    blocks.push(
      <p key={`paragraph-${index}`} className="leading-7 text-slate-700">
        {renderInlineMarkdown(paragraph.text)}
      </p>,
    )
    index = paragraph.nextIndex
  }

  return <div className="space-y-5">{blocks}</div>
}
