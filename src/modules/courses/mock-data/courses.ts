import type { CourseEntity } from '../api/course.types'

export const courses: CourseEntity[] = [
  {
    _entityName: 'Course',
    id: 'course-1',
    name: 'ГОДОВОЙ КУРС ОГЭ | ЕГОР ФРИДМАН',
    startDate: new Date(),
    endDate: new Date(),
    description: 'Описание курса',
    thumbnailId: 'thumbnail-id',
    subjectId: 'subject-1',
    subject: {
      _entityName: 'Subject',
      id: 'subject-1',
      name: 'Профильная математика',
      color: '#ff9300',
      createdAt: new Date(),
      updatedAt: null
    },
    createdAt: new Date(),
    updatedAt: null
  },
  {
    _entityName: 'Course',
    id: 'course-2',
    name: 'ГОДОВОЙ КУРС ОГЭ | АНДРЕЙ СЕРГЕЕВ',
    startDate: new Date(),
    endDate: new Date(),
    description: 'Описание курса',
    thumbnailId: 'thumbnail-id-2',
    subjectId: 'subject-2',
    subject: {
      _entityName: 'Subject',
      id: 'subject-2',
      name: 'Физика',
      color: '#0432ff',
      createdAt: new Date(),
      updatedAt: null
    },
    createdAt: new Date(),
    updatedAt: null
  }
]
