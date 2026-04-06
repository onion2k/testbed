import { buildWorkshopParts, parseQuizGate } from '../../src/content/workshop-parser'

describe('workshop parser', () => {
  it('splits markdown on level 1 and 2 headings only', () => {
    const parts = buildWorkshopParts(`# Title

Intro paragraph.

## Part A
Body copy.

### Subheading
Still same part.

## Part B
More body.`)

    expect(parts).toHaveLength(3)
    expect(parts.map((part) => part.title)).toEqual(['Title', 'Part A', 'Part B'])
  })

  it('extracts quiz blocks from a part', () => {
    const parts = buildWorkshopParts(`## Part A

Explainer copy.

\`\`\`quiz
id: sample-check
question: Which answer is correct?
passCondition: all
- id: a
label: First
correct: true
- id: b
label: Second
correct: false
\`\`\`
`)

    expect(parts[0]?.quiz?.id).toBe('sample-check')
    expect(parts[0]?.markdown).not.toContain('```quiz')
  })

  it('returns null for invalid quiz definitions', () => {
    expect(parseQuizGate(`id: broken
question: Missing options`)).toBeNull()
  })
})
