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
}

export const workshopEntries: WorkshopEntry[] = [
  {
    slug: 'manual-qa-to-automation',
    title: 'Manual QA to Automation Workshop',
    category: 'Automation Foundations',
    summary: 'Start with manual exploration, then move into Playwright Codegen, better test design, and Postman API checks.',
    markdown: manualQaToAutomationWorkshop,
  },
  {
    slug: 'shift-left-test-planning',
    title: 'Shift-Left Test Planning Workshop',
    category: 'Planning',
    summary: 'Learn to identify risks, dependencies, and coverage before execution starts.',
    markdown: shiftLeftTestPlanningWorkshop,
  },
  {
    slug: 'bug-investigation',
    title: 'Bug Investigation Workshop',
    category: 'Execution Skills',
    summary: 'Practise controlled reproduction, evidence gathering, and stronger defect reporting.',
    markdown: bugInvestigationWorkshop,
  },
  {
    slug: 'negative-testing',
    title: 'Negative Testing Workshop',
    category: 'Execution Skills',
    summary: 'Design and execute failure-focused testing using presets, fault modes, and API evidence.',
    markdown: negativeTestingWorkshop,
  },
  {
    slug: 'flaky-test-reduction',
    title: 'Flaky Test Reduction Workshop',
    category: 'Automation Quality',
    summary: 'Reduce instability through better setup, selectors, assertions, and synchronization.',
    markdown: flakyTestReductionWorkshop,
  },
  {
    slug: 'test-case-design',
    title: 'Test Case Design Workshop',
    category: 'Planning',
    summary: 'Use partitions, boundaries, decision tables, and state transitions to design leaner coverage.',
    markdown: testCaseDesignWorkshop,
  },
  {
    slug: 'selectors-and-testability',
    title: 'Selectors and Testability Workshop',
    category: 'Automation Quality',
    summary: 'Choose stronger locators and learn how to ask for better automation hooks.',
    markdown: selectorsAndTestabilityWorkshop,
  },
  {
    slug: 'regression-strategy',
    title: 'Regression Strategy Workshop',
    category: 'Planning',
    summary: 'Decide what belongs in smoke, core regression, and deeper targeted coverage.',
    markdown: regressionStrategyWorkshop,
  },
  {
    slug: 'risk-based-testing',
    title: 'Risk-Based Testing Workshop',
    category: 'Planning',
    summary: 'Prioritize testing effort using impact, likelihood, and change risk.',
    markdown: riskBasedTestingWorkshop,
  },
  {
    slug: 'api-contract-testing',
    title: 'API Contract Testing Workshop',
    category: 'API Testing',
    summary: 'Validate response structure, error contracts, and consumer-facing API behavior.',
    markdown: apiContractTestingWorkshop,
  },
  {
    slug: 'exploratory-testing-to-automation',
    title: 'Exploratory Testing to Automation Workshop',
    category: 'Execution Skills',
    summary: 'Turn exploratory findings into repeatable Playwright and Postman coverage.',
    markdown: exploratoryTestingToAutomationWorkshop,
  },
  {
    slug: 'accessibility-testing',
    title: 'Accessibility Testing Workshop',
    category: 'Quality Practices',
    summary: 'Build accessibility into mainstream testing through keyboard, label, and role-focused checks.',
    markdown: accessibilityTestingWorkshop,
  },
  {
    slug: 'test-data-management',
    title: 'Test Data Management Workshop',
    category: 'Quality Practices',
    summary: 'Use reset, presets, and seeded data deliberately to keep test outcomes trustworthy.',
    markdown: testDataManagementWorkshop,
  },
  {
    slug: 'release-readiness',
    title: 'Release Readiness Workshop',
    category: 'Quality Practices',
    summary: 'Assess release confidence by coverage, blockers, residual risk, and recommendation quality.',
    markdown: releaseReadinessWorkshop,
  },
]

export const defaultWorkshopSlug = workshopEntries[0]?.slug ?? ''

export function findWorkshopBySlug(slug?: string) {
  return workshopEntries.find((entry) => entry.slug === slug) ?? workshopEntries[0] ?? null
}
