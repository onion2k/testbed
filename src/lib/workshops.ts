import { buildWorkshopParts } from '../content/workshop-parser'
import introductionToTestbedWorkshop from '../../docs/introduction-to-testbed-workshop.md?raw'
import accessibilityTestingWorkshop from '../../docs/accessibility-testing-workshop.md?raw'
import apiContractTestingWorkshop from '../../docs/api-contract-testing-workshop.md?raw'
import browserStackAutomateWorkshop from '../../docs/browserstack-automate-workshop.md?raw'
import bugInvestigationWorkshop from '../../docs/bug-investigation-workshop.md?raw'
import exploratoryTestingToAutomationWorkshop from '../../docs/exploratory-testing-to-automation-workshop.md?raw'
import flakyTestReductionWorkshop from '../../docs/flaky-test-reduction-workshop.md?raw'
import indepthApiTestingUsingPostmanWorkshop from '../../docs/indepth-api-testing-using-postman-workshop.md?raw'
import manualQaToAutomationWorkshop from '../../docs/manual-qa-to-automation-workshop.md?raw'
import negativeTestingWorkshop from '../../docs/negative-testing-workshop.md?raw'
import pageObjectModelsWorkshop from '../../docs/page-object-models-workshop.md?raw'
import repairingTestsWorkshop from '../../docs/repairing-tests-workshop.md?raw'
import regressionStrategyWorkshop from '../../docs/regression-strategy-workshop.md?raw'
import releaseReadinessWorkshop from '../../docs/release-readiness-workshop.md?raw'
import riskBasedTestingWorkshop from '../../docs/risk-based-testing-workshop.md?raw'
import runningTestsLocallyWorkshop from '../../docs/running-tests-locally-workshop.md?raw'
import selectorsAndTestabilityWorkshop from '../../docs/selectors-and-testability-workshop.md?raw'
import shiftLeftTestPlanningWorkshop from '../../docs/shift-left-test-planning-workshop.md?raw'
import testCaseDesignWorkshop from '../../docs/test-case-design-workshop.md?raw'
import testDataManagementWorkshop from '../../docs/test-data-management-workshop.md?raw'
import usingAiToGenerateTestsWorkshop from '../../docs/using-ai-to-generate-tests-workshop.md?raw'
import usingGitToSaveTestsWorkshop from '../../docs/using-git-to-save-tests-workshop.md?raw'
import usingPlaywrightWorkshop from '../../docs/using-playwright-workshop.md?raw'
import whatIsCicdWorkshop from '../../docs/what-is-cicd-workshop.md?raw'
import whatToDoIfATestFailsWorkshop from '../../docs/what-to-do-if-a-test-fails-workshop.md?raw'

export interface WorkshopEntry {
  slug: string
  title: string
  category: string
  summary: string
  estimatedEffort: string
  launchTarget?: {
    type: 'route' | 'desktop-tab'
    value: string
    label: string
  }
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
    estimatedEffort: '60-75 min',
    launchTarget: { type: 'route', value: '/', label: 'Open Home' },
    markdown: introductionToTestbedWorkshop,
  }),
  createWorkshopEntry({
    slug: 'shift-left-test-planning',
    title: 'Shift-Left Test Planning',
    category: 'Planning',
    summary: 'Learn to identify risks, dependencies, and coverage before execution starts.',
    estimatedEffort: '60-75 min',
    markdown: shiftLeftTestPlanningWorkshop,
  }),
  createWorkshopEntry({
    slug: 'bug-investigation',
    title: 'Bug Investigation',
    category: 'Execution Skills',
    summary: 'Practise controlled reproduction, evidence gathering, and stronger defect reporting.',
    estimatedEffort: '60-75 min',
    launchTarget: { type: 'desktop-tab', value: 'tracing', label: 'Open Tracing' },
    markdown: bugInvestigationWorkshop,
  }),
  createWorkshopEntry({
    slug: 'negative-testing',
    title: 'Negative Testing',
    category: 'Execution Skills',
    summary: 'Design and execute failure-focused testing using presets, fault modes, and API evidence.',
    estimatedEffort: '60-75 min',
    launchTarget: { type: 'desktop-tab', value: 'scenarios', label: 'Open Scenarios & Faults' },
    markdown: negativeTestingWorkshop,
  }),
  createWorkshopEntry({
    slug: 'test-case-design',
    title: 'Test Case Design',
    category: 'Planning',
    summary: 'Use partitions, boundaries, decision tables, and state transitions to design leaner coverage.',
    estimatedEffort: '60-75 min',
    markdown: testCaseDesignWorkshop,
  }),
  createWorkshopEntry({
    slug: 'release-readiness',
    title: 'Release Readiness',
    category: 'Planning',
    summary: 'Assess release confidence by coverage, blockers, residual risk, and recommendation quality.',
    estimatedEffort: '60-75 min',
    markdown: releaseReadinessWorkshop,
  }),
  createWorkshopEntry({
    slug: 'manual-qa-to-automation',
    title: 'Manual QA to Automation',
    category: 'Automation Foundations',
    summary: 'Start with manual exploration, then move into Playwright Codegen, better test design, and Postman API checks.',
    estimatedEffort: '60-75 min',
    launchTarget: { type: 'route', value: '/shop', label: 'Open Shop' },
    markdown: manualQaToAutomationWorkshop,
  }),
  createWorkshopEntry({
    slug: 'running-tests-locally',
    title: 'Running Tests Locally',
    category: 'Automation Foundations',
    summary: 'Set up Testbed predictably and run local automation with reproducible state and clearer debugging.',
    estimatedEffort: '60-75 min',
    markdown: runningTestsLocallyWorkshop,
  }),
  createWorkshopEntry({
    slug: 'what-to-do-if-a-test-fails',
    title: 'What To Do If a Test Fails',
    category: 'Automation Foundations',
    summary: 'Respond to failing automation by gathering evidence, reproducing the issue, and choosing the right fix.',
    estimatedEffort: '60-75 min',
    markdown: whatToDoIfATestFailsWorkshop,
  }),
  createWorkshopEntry({
    slug: 'using-playwright',
    title: 'Using Playwright',
    category: 'Automation Foundations',
    summary: 'Learn the shape of Playwright tests, better locators, meaningful assertions, and practical browser automation.',
    estimatedEffort: '60-75 min',
    launchTarget: { type: 'route', value: '/shop', label: 'Open Shop' },
    markdown: usingPlaywrightWorkshop,
  }),
  createWorkshopEntry({
    slug: 'exploratory-testing-to-automation',
    title: 'Exploratory Testing to Automation',
    category: 'Automation Foundations',
    summary: 'Turn exploratory findings into repeatable Playwright and Postman coverage.',
    estimatedEffort: '60-75 min',
    markdown: exploratoryTestingToAutomationWorkshop,
  }),
  createWorkshopEntry({
    slug: 'selectors-and-testability',
    title: 'Selectors and Testability',
    category: 'Automation Quality',
    summary: 'Choose stronger locators and learn how to ask for better automation hooks.',
    estimatedEffort: '60-75 min',
    markdown: selectorsAndTestabilityWorkshop,
  }),
  createWorkshopEntry({
    slug: 'flaky-test-reduction',
    title: 'Flaky Test Reduction',
    category: 'Automation Quality',
    summary: 'Reduce instability through better setup, selectors, assertions, and synchronization.',
    estimatedEffort: '60-75 min',
    markdown: flakyTestReductionWorkshop,
  }),
  createWorkshopEntry({
    slug: 'page-object-models',
    title: 'Better Automation with Page Object Models',
    category: 'Automation Quality',
    summary: 'Use Page Object Models to reduce duplication without hiding intent or over-abstracting tests.',
    estimatedEffort: '60-75 min',
    markdown: pageObjectModelsWorkshop,
  }),
  createWorkshopEntry({
    slug: 'using-git-to-save-tests',
    title: 'Using Git to Save Tests',
    category: 'Advanced Automation Testing',
    summary: 'Learn the practical Git habits testers need to save, review, and share automation safely.',
    estimatedEffort: '60-75 min',
    markdown: usingGitToSaveTestsWorkshop,
  }),
  createWorkshopEntry({
    slug: 'using-ai-to-generate-tests',
    title: 'Using AI to Generate Tests',
    category: 'Advanced Automation Testing',
    summary: 'Use AI to speed up test drafting while still reviewing selectors, assertions, and coverage critically.',
    estimatedEffort: '60-75 min',
    markdown: usingAiToGenerateTestsWorkshop,
  }),
  createWorkshopEntry({
    slug: 'browserstack-automate',
    title: 'BrowserStack Automate',
    category: 'Advanced Automation Testing',
    summary: 'Learn where hosted cross-browser execution fits into an automation strategy and how to use it well.',
    estimatedEffort: '60-75 min',
    markdown: browserStackAutomateWorkshop,
  }),
  createWorkshopEntry({
    slug: 'what-is-cicd',
    title: 'What Is CI/CD',
    category: 'Advanced Automation Testing',
    summary: 'Understand CI/CD in testing terms and how automated checks fit into build and release pipelines.',
    estimatedEffort: '60-75 min',
    markdown: whatIsCicdWorkshop,
  }),
  createWorkshopEntry({
    slug: 'repairing-tests',
    title: 'Repairing Tests',
    category: 'Advanced Automation Testing',
    summary: 'Repair failing automated tests by fixing the right root cause instead of weakening the test.',
    estimatedEffort: '60-75 min',
    markdown: repairingTestsWorkshop,
  }),
  createWorkshopEntry({
    slug: 'regression-strategy',
    title: 'Regression Strategy',
    category: 'Planning',
    summary: 'Decide what belongs in smoke, core regression, and deeper targeted coverage.',
    estimatedEffort: '60-75 min',
    markdown: regressionStrategyWorkshop,
  }),
  createWorkshopEntry({
    slug: 'risk-based-testing',
    title: 'Risk-Based Testing',
    category: 'Planning',
    summary: 'Prioritize testing effort using impact, likelihood, and change risk.',
    estimatedEffort: '60-75 min',
    markdown: riskBasedTestingWorkshop,
  }),
  createWorkshopEntry({
    slug: 'api-contract-testing',
    title: 'API Contract Testing',
    category: 'API Testing',
    summary: 'Validate response structure, error contracts, and consumer-facing API behavior.',
    estimatedEffort: '60-75 min',
    launchTarget: { type: 'desktop-tab', value: 'postman', label: 'Open Postman' },
    markdown: apiContractTestingWorkshop,
  }),
  createWorkshopEntry({
    slug: 'indepth-api-testing-using-postman',
    title: 'In-Depth API Testing Using Postman',
    category: 'API Testing',
    summary: 'Use Postman for chained API flows, stronger assertions, negative paths, and contract-focused checks.',
    estimatedEffort: '60-75 min',
    launchTarget: { type: 'desktop-tab', value: 'postman', label: 'Open Postman' },
    markdown: indepthApiTestingUsingPostmanWorkshop,
  }),
  createWorkshopEntry({
    slug: 'accessibility-testing',
    title: 'Accessibility Testing',
    category: 'Quality Practices',
    summary: 'Build accessibility into mainstream testing through keyboard, label, and role-focused checks.',
    estimatedEffort: '60-75 min',
    markdown: accessibilityTestingWorkshop,
  }),
  createWorkshopEntry({
    slug: 'test-data-management',
    title: 'Test Data Management',
    category: 'Quality Practices',
    summary: 'Use reset, presets, and seeded data deliberately to keep test outcomes trustworthy.',
    estimatedEffort: '60-75 min',
    launchTarget: { type: 'desktop-tab', value: 'data-folder', label: 'Open Data Folder' },
    markdown: testDataManagementWorkshop,
  }),
]

export const defaultWorkshopSlug = workshopEntries[0]?.slug ?? ''

export function findWorkshopBySlug(slug?: string) {
  return workshopEntries.find((entry) => entry.slug === slug) ?? workshopEntries[0] ?? null
}
