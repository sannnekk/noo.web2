import type { IconName } from '@/components/icons/noo-icon.vue'
import type { SupportCategory } from './api/support.types'

/**
 * Editorial copy for the help home page.
 *
 * What is here is structural — the three categories the articles are filed
 * under, and the walkthrough of the platform itself — and changes with the
 * product rather than with the week, so it ships with the code. The parts the
 * support team edits day to day live elsewhere: the FAQ in the database (see
 * `SupportFaqItemEntity`), the links and contacts in the platform settings.
 */

export interface HelpCategoryContent {
  category: SupportCategory
  title: string
  description: string
  icon: IconName
}

export interface HelpStepContent {
  title: string
  description: string
  /** The category to read more in, where one covers the step. */
  category?: SupportCategory
}

/**
 * The three article categories, in the order the header menu lists them.
 */
const helpCategories: HelpCategoryContent[] = [
  {
    category: 'courses',
    title: 'Курсы',
    description: 'Доступ к курсам, материалы, конспекты, видео и тесты',
    icon: 'uni-cap'
  },
  {
    category: 'payment',
    title: 'Оплата',
    description: 'Оплата и продление подписки, чеки и возвраты',
    icon: 'payment'
  },
  {
    category: 'works',
    title: 'Работы',
    description: 'Домашние работы, сдача на проверку, оценки и комментарии',
    icon: 'list'
  }
]

/**
 * Prefilled queries under the search field. They are hints about what the help
 * section covers as much as shortcuts, so they are phrased the way a student
 * would ask rather than the way an article is titled.
 */
const helpPopularQueries: string[] = [
  'Не приходит письмо',
  'Забыл пароль',
  'Как сдать работу',
  'Не открывается курс',
  'Вернуть оплату'
]

/**
 * The path through the platform, from first login to a checked work. Mirrors
 * the numbered "как проходит обучение" strip on no-os.ru, but describes the
 * platform rather than the course.
 */
const helpQuickStartSteps: HelpStepContent[] = [
  {
    title: 'Войдите в платформу',
    description:
      'По почте и паролю, которые вы указали при регистрации. Если пароль не подходит — восстановите его на странице входа.'
  },
  {
    title: 'Найдите свой курс',
    description:
      'Все курсы, к которым у вас есть доступ, лежат в разделе «Курсы». Нужный можно закрепить, чтобы он был первым.',
    category: 'courses'
  },
  {
    title: 'Изучите материал',
    description:
      'Внутри курса — конспекты, видео и тесты. Материалы идут по порядку, но открыть можно любой.',
    category: 'courses'
  },
  {
    title: 'Сдайте работу',
    description:
      'Работы приходят в раздел «Работы». Ответы можно сохранять и дописывать, пока не отправите на проверку.',
    category: 'works'
  },
  {
    title: 'Посмотрите оценку',
    description:
      'После проверки в работе появятся баллы и комментарии куратора к каждому заданию.',
    category: 'works'
  },
  {
    title: 'Спросите, если что-то непонятно',
    description:
      'По заданию — куратору в комментариях к работе. По платформе и оплате — нам в поддержку.'
  }
]

export { helpCategories, helpPopularQueries, helpQuickStartSteps }
