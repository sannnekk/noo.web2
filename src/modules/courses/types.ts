import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type {
  CourseChapterEntity,
  CourseEntity,
  CourseMaterialContentEntity,
  CourseMaterialEntity
} from './api/course.types'

export type CourseListTab = 'all' | 'own' | 'archived'

export type PossiblyUnsavedMaterialContent = PossiblyUnsavedEntity<
  CourseMaterialContentEntity,
  CourseMaterialContentEntity['_entityName']
>

export type PossiblyUnsavedMaterial = PossiblyUnsavedEntity<
  CourseMaterialEntity,
  CourseMaterialEntity['_entityName']
>

export type PossiblyUnsavedChapter = Omit<
  PossiblyUnsavedEntity<
    CourseChapterEntity,
    CourseChapterEntity['_entityName']
  >,
  'materials' | 'subChapters'
> & {
  materials: PossiblyUnsavedMaterial[]
  subChapters: PossiblyUnsavedChapter[]
}

export type PossiblyUnsavedCourse = Omit<
  PossiblyUnsavedEntity<CourseEntity, CourseEntity['_entityName']>,
  'chapters' | 'subjectId'
> & {
  chapters: PossiblyUnsavedChapter[]
  subjectId: string | null
}

export type PossiblyUnsavedCourseMaterialContent = PossiblyUnsavedEntity<
  CourseMaterialContentEntity,
  CourseMaterialContentEntity['_entityName']
>
