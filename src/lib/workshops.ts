import introductionToTestbedWorkshop from '../../docs/introduction-to-testbed-workshop.md?raw'
import accessibilityTestingWorkshop from '../../docs/accessibility-testing-workshop.md?raw'
import apiContractTestingWorkshop from '../../docs/api-contract-testing-workshop.md?raw'
import bugInvestigationWorkshop from '../../docs/bug-investigation-workshop.md?raw'
import exploratoryTestingToAutomationWorkshop from '../../docs/exploratory-testing-to-automation-workshop.md?raw'
import flakyTestReductionWorkshop from '../../docs/flaky-test-reduction-workshop.md?raw'
import manualQaToAutomationWorkshop from '../../docs/manual-qa-to-automation-workshop.md?raw'
import negativeTestingWorkshop from '../../docs/negative-testing-workshop.md?raw'
import regressionStrategyWorkshop from '../../docs/regression-strategy-workshop.md?raw'
import releaseReadinessWorkshop from '../../docs/release-readiness-workshop.md?raw'
import riskBasedTestingWorkshop from '../../docs/risk-based-testing-workshop.md?raw'
import selectorsAndTestabilityWorkshop from '../../docs/selectors-and-testability-workshop.md?raw'
import shiftLeftTestPlanningWorkshop from '../../docs/shift-left-test-planning-workshop.md?raw'
import testCaseDesignWorkshop from '../../docs/test-case-design-workshop.md?raw'
import testDataManagementWorkshop from '../../docs/test-data-management-workshop.md?raw'

export interface WorkshopEntry {
  slug: string
  title: string
  category: string
  summary: string
  markdown: string
  parts: WorkshopPart[]
}

export interface WorkshopPart {
  slug: string
  title: string
  markdown: string
  quiz: WorkshopQuizGate | null
}

export interface WorkshopQuizGate {
  id: string
  question: string
  passCondition: 'all'
  options: WorkshopQuizOption[]
}

export interface WorkshopQuizOption {
  id: string
  label: string
  correct: boolean
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildWorkshopParts(markdown: string) {
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

function extractQuizGate(markdown: string) {
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

function parseQuizGate(content: string): WorkshopQuizGate | null {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  let id = ''
  let question = ''
  let passCondition: 'all' = 'all'
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
      passCondition = 'all'
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

function createWorkshopEntry(entry: Omit<WorkshopEntry, 'parts'>): WorkshopEntry {
  return {
    ...entry,
    parts: buildWorkshopParts(entry.markdown),
  }
}

export const workshopEntries: WorkshopEntry[] = [
  createWorkshopEntry({
    slug: 'introduction-to-testbed',
    title: 'Introduction to Testbed',
    category: 'Getting Started',
    summary: 'Learn what Testbed is, how the browser app and desktop app fit together, and where to begin.',
    markdown: introductionToTestbedWorkshop,
  }),
  createWorkshopEntry({
    slug: 'manual-qa-to-automation',
    title: 'Manual QA to Automation Workshop',
    category: 'Automation Foundations',
    summary: 'Start with manual exploration, then move into Playwright Codegen, better test design, and Postman API checks.',
    markdown: manualQaToAutomationWorkshop,
  }),
  createWorkshopEntry({
    slug: 'shift-left-test-planning',
    title: 'Shift-Left Test Planning Workshop',
    category: 'Planning',
    summary: 'Learn to identify risks, dependencies, and coverage before execution starts.',
    markdown: shiftLeftTestPlanningWorkshop,
  }),
  createWorkshopEntry({
    slug: 'bug-investigation',
    title: 'Bug Investigation Workshop',
    category: 'Execution Skills',
    summary: 'Practise controlled reproduction, evidence gathering, and stronger defect reporting.',
    markdown: bugInvestigationWorkshop,
  }),
  createWorkshopEntry({
    slug: 'negative-testing',
    title: 'Negative Testing Workshop',
    category: 'Execution Skills',
    summary: 'Design and execute failure-focused testing using presets, fault modes, and API evidence.',
    markdown: negativeTestingWorkshop,
  }),
  createWorkshopEntry({
    slug: 'flaky-test-reduction',
    title: 'Flaky Test Reduction Workshop',
    category: 'Automation Quality',
    summary: 'Reduce instability through better setup, selectors, assertions, and synchronization.',
    markdown: flakyTestReductionWorkshop,
  }),
  createWorkshopEntry({
    slug: 'test-case-design',
    title: 'Test Case Design Workshop',
    category: 'Planning',
    summary: 'Use partitions, boundaries, decision tables, and state transitions to design leaner coverage.',
    markdown: testCaseDesignWorkshop,
  }),
  createWorkshopEntry({
    slug: 'selectors-and-testability',
    title: 'Selectors and Testability Workshop',
    category: 'Automation Quality',
    summary: 'Choose stronger locators and learn how to ask for better automation hooks.',
    markdown: selectorsAndTestabilityWorkshop,
  }),
  createWorkshopEntry({
    slug: 'regression-strategy',
    title: 'Regression Strategy Workshop',
    category: 'Planning',
    summary: 'Decide what belongs in smoke, core regression, and deeper targeted coverage.',
    markdown: regressionStrategyWorkshop,
  }),
  createWorkshopEntry({
    slug: 'risk-based-testing',
    title: 'Risk-Based Testing Workshop',
    category: 'Planning',
    summary: 'Prioritize testing effort using impact, likelihood, and change risk.',
    markdown: riskBasedTestingWorkshop,
  }),
  createWorkshopEntry({
    slug: 'api-contract-testing',
    title: 'API Contract Testing Workshop',
    category: 'API Testing',
    summary: 'Validate response structure, error contracts, and consumer-facing API behavior.',
    markdown: apiContractTestingWorkshop,
  }),
  createWorkshopEntry({
    slug: 'exploratory-testing-to-automation',
    title: 'Exploratory Testing to Automation Workshop',
    category: 'Execution Skills',
    summary: 'Turn exploratory findings into repeatable Playwright and Postman coverage.',
    markdown: exploratoryTestingToAutomationWorkshop,
  }),
  createWorkshopEntry({
    slug: 'accessibility-testing',
    title: 'Accessibility Testing Workshop',
    category: 'Quality Practices',
    summary: 'Build accessibility into mainstream testing through keyboard, label, and role-focused checks.',
    markdown: accessibilityTestingWorkshop,
  }),
  createWorkshopEntry({
    slug: 'test-data-management',
    title: 'Test Data Management Workshop',
    category: 'Quality Practices',
    summary: 'Use reset, presets, and seeded data deliberately to keep test outcomes trustworthy.',
    markdown: testDataManagementWorkshop,
  }),
  createWorkshopEntry({
    slug: 'release-readiness',
    title: 'Release Readiness Workshop',
    category: 'Quality Practices',
    summary: 'Assess release confidence by coverage, blockers, residual risk, and recommendation quality.',
    markdown: releaseReadinessWorkshop,
  }),
]

export const defaultWorkshopSlug = workshopEntries[0]?.slug ?? ''

export function findWorkshopBySlug(slug?: string) {
  return workshopEntries.find((entry) => entry.slug === slug) ?? workshopEntries[0] ?? null
}
