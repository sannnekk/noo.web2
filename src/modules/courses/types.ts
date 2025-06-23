import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type {
  CourseChapterEntity,
  CourseEntity,
  CourseMaterialContentEntity,
  CourseMaterialEntity
} from './api/course.types'

export type CourseListTab = 'all' | 'own' | 'archived'

export type PossiblyUnsavedMaterialContent =
  PossiblyUnsavedEntity<CourseMaterialContentEntity>

export type PossiblyUnsavedMaterial =
  PossiblyUnsavedEntity<CourseMaterialEntity>

export type PossiblyUnsavedChapter = Omit<
  PossiblyUnsavedEntity<CourseChapterEntity>,
  'materials' | 'subChapters'
> & {
  materials: PossiblyUnsavedMaterial[]
  subChapters: PossiblyUnsavedChapter[]
}

export type PossiblyUnsavedCourse = Omit<
  PossiblyUnsavedEntity<CourseEntity>,
  'chapters' | 'subjectId'
> & {
  chapters: PossiblyUnsavedChapter[]
  subjectId: string | null
}
