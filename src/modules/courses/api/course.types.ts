import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { NooTubeVideoEntity } from '@/modules/nootube/api/nootube.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
import type { UserEntity } from '@/modules/users/api/user.types'
import type { WorkEntity } from '@/modules/works/api/work.types'

export interface CourseEntity extends ApiEntity<'Course'> {
  name: string
  startDate: Date
  endDate: Date
  description: string | null
  thumbnailId: string | null
  thumbnail?: MediaEntity
  memberCount?: number
  subjectId: string
  subject?: SubjectEntity | null
  authors?: UserEntity[]
  chapters?: CourseChapterEntity[]
}

export interface CourseChapterEntity extends ApiEntity<'CourseChapter'> {
  title: string
  color: string | null
  isActive: boolean
  subChapters?: CourseChapterEntity[]
  materials?: CourseMaterialEntity[]
}

export interface CourseMaterialEntity extends ApiEntity<'CourseMaterial'> {
  title: string
  titleColor: string | null
  isActive: boolean
  publishAt: Date | null
  contentId: string
}

export interface CourseMaterialContentEntity
  extends ApiEntity<'CourseMaterialContent'> {
  content: IRichText
  workId?: string | null
  isWorkAvailable: boolean
  workSolveDeadlineAt: Date | null
  workCheckDeadlineAt: Date | null
  files?: MediaEntity[]
  videos?: NooTubeVideoEntity[]
  work?: WorkEntity
}

export type CourseMembershipType =
  | 'manual-assigned'
  | 'external-assigned'
  | 'subscription'

export interface CourseMembershipEntity extends ApiEntity<'CourseMembership'> {
  type: CourseMembershipType
  courseId: string
  course?: CourseEntity
  isActive: boolean
  isArchived: boolean
  studentId: string
  student?: UserEntity
  assignerId?: string
  assigner?: UserEntity
}

export interface CreateCourseMembershipPayload {
  studentId: string
  courseId: string
  notifyStudent?: boolean
}
