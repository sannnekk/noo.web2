import {
  createUsePermissions,
  definePermissions,
  roles
} from '@/core/permissions/permission-policy'

const TaskCardsPermissions = {
  viewListPage: 'viewListPage',
  viewQuizPage: 'viewQuizPage',
  saveTask: 'saveTask'
} as const

type TaskCardsPermission =
  (typeof TaskCardsPermissions)[keyof typeof TaskCardsPermissions]

// Saved tasks are a student's own revision pile: nobody else has one, so no
// other role gets the pages or the button.
const taskCardsPermissionPolicy = definePermissions({
  [TaskCardsPermissions.viewListPage]: roles('student'),
  [TaskCardsPermissions.viewQuizPage]: roles('student'),
  [TaskCardsPermissions.saveTask]: roles('student')
})

const useTaskCardsPermissions = createUsePermissions(taskCardsPermissionPolicy)

export type { TaskCardsPermission }
export {
  TaskCardsPermissions,
  taskCardsPermissionPolicy,
  useTaskCardsPermissions
}
