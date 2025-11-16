import type { ApiResponse } from '@/core/api/api.utils'
import type { CourseEntity } from '../api/course.types'

export const courseApiResponse: ApiResponse<CourseEntity> = {
  data: {
    _entityName: 'Course',
    id: 'course-1',
    name: 'ЭКСПРЕСС-КУРС ОГЭ | ВАЛЯ',
    startDate: new Date(),
    endDate: new Date(),
    description:
      'Этот курс поможет вам подготовиться к ОГЭ по профильной химии. Он включает в себя видеоуроки, тесты и практические задания, которые помогут вам освоить материал и успешно сдать экзамен.',
    thumbnailId: 'thumbnail-id',
    subjectId: 'subject-1',
    authors: [],
    subject: {
      _entityName: 'Subject',
      id: 'subject-1',
      name: 'Химия',
      color: '#ff9300',
      createdAt: new Date(),
      updatedAt: null
    },
    chapters: [
      {
        _entityName: 'CourseChapter',
        id: 'chapter-1',
        color: null,
        isActive: true,
        title: 'Памятка для новеньких',
        createdAt: new Date(),
        updatedAt: null,
        subChapters: [
          {
            _entityName: 'CourseChapter',
            id: 'sub-chapter-1',
            title: 'Видео о работе с платформой',
            color: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: null,
            materials: [
              {
                _entityName: 'CourseMaterial',
                id: 'material-1',
                title: 'Первое видео',
                titleColor: null,
                publishAt: new Date(),
                isActive: true,
                contentId: 'content-1',
                createdAt: new Date(),
                updatedAt: null
              },
              {
                _entityName: 'CourseMaterial',
                id: 'material-2',
                title: 'Второе видео',
                titleColor: null,
                publishAt: new Date(),
                isActive: true,
                contentId: 'content-2',
                createdAt: new Date(),
                updatedAt: null
              }
            ]
          },
          {
            _entityName: 'CourseChapter',
            id: 'sub-chapter-2',
            title: 'Прочитай!',
            color: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: null,
            materials: [
              {
                _entityName: 'CourseMaterial',
                id: 'material-3',
                title: 'Что-то пошло не так?',
                titleColor: null,
                publishAt: new Date(),
                isActive: true,
                contentId: 'content-3',
                createdAt: new Date(),
                updatedAt: null
              }
            ]
          }
        ],
        materials: [
          {
            _entityName: 'CourseMaterial',
            id: 'material-4',
            title: 'Контакты преподавателей',
            titleColor: null,
            publishAt: new Date(),
            isActive: true,
            contentId: 'content-4',
            createdAt: new Date(),
            updatedAt: null
          },
          {
            _entityName: 'CourseMaterial',
            id: 'material-5',
            title: 'Расписание',
            titleColor: null,
            publishAt: new Date(),
            isActive: true,
            contentId: 'content-5',
            createdAt: new Date(),
            updatedAt: null
          }
        ]
      },
      {
        _entityName: 'CourseChapter',
        id: 'chapter-2',
        color: null,
        isActive: true,
        title: 'Шпоры на ОГЭ',
        createdAt: new Date(),
        updatedAt: null,
        materials: [
          {
            _entityName: 'CourseMaterial',
            id: 'material-6',
            title: 'Методички',
            titleColor: null,
            publishAt: new Date(),
            isActive: true,
            contentId: 'content-6',
            createdAt: new Date(),
            updatedAt: null
          },
          {
            _entityName: 'CourseMaterial',
            id: 'material-7',
            title: 'Файлы для скачивания',
            titleColor: null,
            publishAt: new Date(),
            isActive: true,
            contentId: 'content-7',
            createdAt: new Date(),
            updatedAt: null
          }
        ]
      },
      {
        _entityName: 'CourseChapter',
        id: 'chapter-3',
        color: null,
        isActive: true,
        title: 'Пробники',
        createdAt: new Date(),
        updatedAt: null,
        materials: [
          {
            _entityName: 'CourseMaterial',
            id: 'material-8',
            title: 'Пробник №1',
            titleColor: null,
            publishAt: new Date(),
            isActive: true,
            contentId: 'content-8',
            createdAt: new Date(),
            updatedAt: null
          },
          {
            _entityName: 'CourseMaterial',
            id: 'material-9',
            title: 'Пробник №2',
            titleColor: null,
            publishAt: new Date(),
            isActive: true,
            contentId: 'content-9',
            createdAt: new Date(),
            updatedAt: null
          },
          {
            _entityName: 'CourseMaterial',
            id: 'material-10',
            title: 'Пробник №3',
            titleColor: null,
            publishAt: new Date(),
            isActive: true,
            contentId: 'content-10',
            createdAt: new Date(),
            updatedAt: null
          }
        ]
      },
      {
        _entityName: 'CourseChapter',
        id: 'chapter-4',
        color: null,
        isActive: true,
        title: 'Общая химия',
        createdAt: new Date(),
        updatedAt: null,
        subChapters: [
          {
            _entityName: 'CourseChapter',
            id: 'sub-chapter-3',
            title:
              'Химия. Атомы и молекулы. Знакомство с ПТ. Хим. элемент. Простые свойства',
            color: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: null,
            materials: [
              {
                _entityName: 'CourseMaterial',
                id: 'material-12',
                title: '01.03 / Теория',
                titleColor: null,
                publishAt: new Date(),
                isActive: true,
                contentId: 'content-12',
                createdAt: new Date(),
                updatedAt: null
              },
              {
                _entityName: 'CourseMaterial',
                id: 'material-13',
                title: '04.03 / Практика',
                titleColor: null,
                publishAt: new Date(),
                isActive: true,
                contentId: 'content-13',
                createdAt: new Date(),
                updatedAt: null
              }
            ]
          }
        ],
        materials: []
      }
    ],
    createdAt: new Date(),
    updatedAt: null
  }
}
