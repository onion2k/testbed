import type { WorkshopPart, WorkshopQuizGate, WorkshopQuizOption } from '../lib/workshops'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildWorkshopParts(markdown: string): WorkshopPart[] {
  const normalized = markdown.replace(/\r\n/g, '\n').trim()
  const lines = normalized.split('\n')
  const sections: WorkshopPart[] = []
  let currentTitle: string | null = null
  let currentLines: string[] = []

  function flushCurrentSection() {
    if (!currentTitle) return
    const partMarkdown = currentLines.join('\n').trim()
    const { markdown: contentMarkdown, quiz } = extractQuizGate(partMarkdown)

    sections.push({
      slug: slugify(currentTitle),
      title: currentTitle,
      markdown: contentMarkdown,
      quiz,
    })
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,2})\s+(.*)$/)

    if (headingMatch) {
      flushCurrentSection()
      currentTitle = headingMatch[2].trim()
      currentLines = [line]
      continue
    }

    if (!currentTitle) continue
    currentLines.push(line)
  }

  flushCurrentSection()
  return sections
}

export function extractQuizGate(markdown: string) {
  const match = markdown.match(/```quiz\s*\n([\s\S]*?)```/)

  if (!match) {
    return {
      markdown,
      quiz: null,
    }
  }

  return {
    markdown: markdown.replace(match[0], '').replace(/\n{3,}/g, '\n\n').trim(),
    quiz: parseQuizGate(match[1]),
  }
}

export function parseQuizGate(content: string): WorkshopQuizGate | null {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  let id = ''
  let question = ''
  const passCondition = 'all' as const
  const options: WorkshopQuizOption[] = []
  let currentOption: WorkshopQuizOption | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const idMatch = line.match(/^id:\s*(.+)$/)
    if (idMatch && !currentOption) {
      id = idMatch[1].trim()
      continue
    }

    const questionMatch = line.match(/^question:\s*(.+)$/)
    if (questionMatch) {
      question = questionMatch[1].trim()
      continue
    }

    const passConditionMatch = line.match(/^passCondition:\s*(.+)$/)
    if (passConditionMatch) {
      continue
    }

    const optionIdMatch = line.match(/^-+\s*id:\s*(.+)$/)
    if (optionIdMatch) {
      if (currentOption) {
        options.push(currentOption)
      }
      currentOption = {
        id: optionIdMatch[1].trim(),
        label: '',
        correct: false,
      }
      continue
    }

    const optionLabelMatch = line.match(/^label:\s*(.+)$/)
    if (optionLabelMatch && currentOption) {
      currentOption.label = optionLabelMatch[1].trim()
      continue
    }

    const optionCorrectMatch = line.match(/^correct:\s*(true|false)$/)
    if (optionCorrectMatch && currentOption) {
      currentOption.correct = optionCorrectMatch[1] === 'true'
    }
  }

  if (currentOption) {
    options.push(currentOption)
  }

  const validOptions = options.filter((option) => option.id && option.label)
  if (!id || !question || validOptions.length < 2 || !validOptions.some((option) => option.correct)) {
    return null
  }

  return {
    id,
    question,
    passCondition,
    options: validOptions,
  }
}
