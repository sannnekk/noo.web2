import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
import type { UserEntity } from '@/modules/users/api/user.types'
import type { WorkEntity } from '@/modules/works/api/work.types'

export interface CourseEntity extends ApiEntity {
  name: string
  startDate: Date
  endDate: Date
  description: string | null
  thumbnailId: string | null
  thumbnail?: MediaEntity
  memberCount?: number
  subjectId: string
  subject?: SubjectEntity
  authors?: UserEntity[]
  chapters?: CourseChapterEntity[]
}

export interface CourseChapterEntity extends ApiEntity {
  title: string
  color: string | null
  isActive: boolean
  subChapters?: CourseChapterEntity[]
  materials?: CourseMaterialEntity[]
}

export interface CourseMaterialEntity extends ApiEntity {
  title: string
  titleColor: string | null
  isActive: boolean
  publishAt: Date | null
  contentId: string
}

export interface CourseMaterialContentEntity extends ApiEntity {
  content: IRichText
  workId?: string | null
  isWorkAvailable: boolean
  workSolveDeadlineAt: Date | null
  workCheckDeadlineAt: Date | null
  files?: MediaEntity[]
  videos?: NooTubeVideoEntity[]
  work?: WorkEntity
}
