import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { NooTubeVideoEntity } from '@/modules/nootube/api/nootube.types'
import type { PollEntity } from '@/modules/polls/api/poll.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
import type { UserEntity } from '@/modules/users/api/user.types'
import type { WorkEntity } from '@/modules/works/api/work.types'

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
  authorIds?: string[]
  isArchived: boolean
  /** Open to every student without an assignment. */
  isPublic: boolean
  chapters?: CourseChapterEntity[]
}

export interface CourseChapterEntity extends ApiEntity<'CourseChapter'> {
  order: number
  title: string
  color: string | null
  isActive: boolean
  parentChapterId?: string
  publishAt: Date | null
  subChapters?: CourseChapterEntity[]
  materials?: CourseMaterialEntity[]
}

const courseMaterialReactionValues = ['check', 'thinking'] as const

export type CourseMaterialReaction =
  (typeof courseMaterialReactionValues)[number]

export interface CourseMaterialEntity extends ApiEntity<'CourseMaterial'> {
  order: number
  title: string
  titleColor: string | null
  isActive: boolean
  isPinned: boolean
  publishAt: Date | null
  chapterId: string
  contentId: string | null
  myReaction?: CourseMaterialReaction | null
}

export interface CourseMaterialContentEntity extends ApiEntity<'CourseMaterialContent'> {
  content: IRichText
  poll?: PollEntity
  pollId: string | null
  nooTubeVideos?: NooTubeVideoEntity[]
  nooTubeVideoIds?: string[]
  medias?: MediaEntity[]
  workAssignments?: CourseWorkAssignmentEntity[]
}

export interface CourseWorkAssignmentEntity extends ApiEntity<'CourseWorkAssignment'> {
  order: number
  workId?: string
  work?: WorkEntity
  note: string | null
  isActive: boolean
  materialContentId: string
  deactivatedAt: Date | null
  solveDeadlineAt: Date | null
  checkDeadlineAt: Date | null
}

const courseMembershipTypeValues = [
  'manual-assigned',
  'external-assigned',
  'subscription'
] as const

export type CourseMembershipType = (typeof courseMembershipTypeValues)[number]

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

const courseAccessSourceValues = ['assignment', 'public'] as const

export type CourseAccessSource = (typeof courseAccessSourceValues)[number]

/**
 * One card in the student's own course list. Covers both assigned courses and publicly open
 * ones, which carry no membership row at all — hence the optional assignment fields.
 */
export interface StudentCourseEntity extends ApiEntity<'StudentCourse'> {
  course: CourseEntity
  isPinned: boolean
  isArchived: boolean
  accessSource: CourseAccessSource
  membershipType?: CourseMembershipType | null
  assignedAt?: Date | null
  assigner?: UserEntity
}

/**
 * The patchable shape of a student's own view of a course — the target of the JSON Patch
 * document sent to `PATCH /course/{courseId}/my-state`.
 */
export interface CourseStudentState {
  isPinned: boolean
  isArchived: boolean
}

export {
  courseAccessSourceValues,
  courseMaterialReactionValues,
  courseMembershipTypeValues
}
