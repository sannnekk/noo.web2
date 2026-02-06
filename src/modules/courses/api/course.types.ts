import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { NooTubeVideoEntity } from '@/modules/nootube/api/nootube.types'
import type { PollEntity } from '@/modules/polls/api/poll.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
import type { UserEntity } from '@/modules/users/api/user.types'

export interface CourseEntity extends ApiEntity<'Course'> {
  name: string
  startDate: Date | null
  endDate: Date | null
  description: string | null
  thumbnailId: string | null
  thumbnail?: MediaEntity
  memberCount?: number | null
  subjectId: string
  subject?: SubjectEntity | null
  authors?: UserEntity[]
  chapters?: CourseChapterEntity[]
}

export interface CourseChapterEntity extends ApiEntity<'CourseChapter'> {
  order: number
  title: string
  color: string | null
  isActive: boolean
  parentChapterId?: string
  subChapters?: CourseChapterEntity[]
  materials?: CourseMaterialEntity[]
}

export interface CourseMaterialEntity extends ApiEntity<'CourseMaterial'> {
  order: number
  title: string
  titleColor: string | null
  isActive: boolean
  publishAt: Date | null
  chapterId: string
  contentId: string
}

export interface CourseMaterialContentEntity
  extends ApiEntity<'CourseMaterialContent'> {
  content: IRichText
  poll?: PollEntity
  nooTubeVideos: NooTubeVideoEntity[]
  medias: MediaEntity[]
  workAssignments: CourseWorkAssignmentEntity[]
}

export interface CourseWorkAssignmentEntity
  extends ApiEntity<'CourseWorkAssignment'> {
  workId?: string
  note: string | null
  isActive: boolean
  deactivatedAt: Date | null
  solveDeadlineAt: Date | null
  checkDeadlineAt: Date | null
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
