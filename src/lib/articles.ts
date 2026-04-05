import whyManualTestersMakeStrongAutomationTestersArticle from '../../docs/articles/why-manual-testers-make-strong-automation-testers.md?raw'
import choosingTheRightTestLevelArticle from '../../docs/articles/choosing-the-right-test-level.md?raw'
import designingAssertionsThatAgeWellArticle from '../../docs/articles/designing-assertions-that-age-well.md?raw'
import howToReadAnApiFailureArticle from '../../docs/articles/how-to-read-an-api-failure.md?raw'
import buildingATestingHabitThatScalesArticle from '../../docs/articles/building-a-testing-habit-that-scales.md?raw'

export interface ArticleEntry {
  slug: string
  title: string
  category: string
  summary: string
  readingLength: 'Short' | 'Medium' | 'Long'
  markdown: string
}

export const articleEntries: ArticleEntry[] = [
  {
    slug: 'why-manual-testers-make-strong-automation-testers',
    title: 'Why Manual Testers Make Strong Automation Testers',
    category: 'Career Growth',
    summary: 'A practical look at why exploratory thinking, curiosity, and careful observation are valuable automation skills.',
    readingLength: 'Short',
    markdown: whyManualTestersMakeStrongAutomationTestersArticle,
  },
  {
    slug: 'choosing-the-right-test-level',
    title: 'Choosing the Right Test Level',
    category: 'Test Strategy',
    summary: 'Learn when a problem is better checked in the UI, at the API layer, or through a smaller contract-style test.',
    readingLength: 'Medium',
    markdown: choosingTheRightTestLevelArticle,
  },
  {
    slug: 'designing-assertions-that-age-well',
    title: 'Designing Assertions That Age Well',
    category: 'Automation Craft',
    summary: 'Write checks that still make sense after copy updates, styling changes, and normal product evolution.',
    readingLength: 'Short',
    markdown: designingAssertionsThatAgeWellArticle,
  },
  {
    slug: 'how-to-read-an-api-failure',
    title: 'How to Read an API Failure',
    category: 'API Skills',
    summary: 'A calm way to investigate status codes, error bodies, and request evidence without jumping to the wrong conclusion.',
    readingLength: 'Medium',
    markdown: howToReadAnApiFailureArticle,
  },
  {
    slug: 'building-a-testing-habit-that-scales',
    title: 'Building a Testing Habit That Scales',
    category: 'Working Practice',
    summary: 'Move from one-off heroics to a repeatable habit of planning, executing, capturing evidence, and learning.',
    readingLength: 'Short',
    markdown: buildingATestingHabitThatScalesArticle,
  },
]

export const defaultArticleSlug = articleEntries[0]?.slug ?? 'articles'
