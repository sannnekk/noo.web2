import { Api, isApiError } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import type { PossiblyUnsavedCourse } from '../types'
import { CourseService } from './course.service'
import type { CreateCourseMembershipPayload } from './course.types'

// Mock the entire API module
vi.mock('@/core/api/api.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/api/api.utils')>()

  return {
    ...actual,
    Api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    }
  }
})

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    test('should fetch courses with pagination', async () => {
      const query = new URLSearchParams()
      query.append('page', '1')
      query.append('perPage', '10')

      const mockPagination: IPagination = {
        page: 1,
        pageSize: 10,
        toQuery: () => query
      }
      const mockData = [{ id: 'c1', name: 'Test Course' }]

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await CourseService.get(mockPagination)

      expect(Api.get).toHaveBeenCalledWith(
        '/course',
        expect.any(URLSearchParams)
      )

      const params = (Api.get as Mock).mock.calls[0]?.[1] as URLSearchParams

      expect(params.get('page')).toBe('1')
      expect(params.get('perPage')).toBe('10')
      expect(!isApiError(result) && result.data).toEqual(mockData)
    })

    test('should fetch courses without pagination', async () => {
      const mockData = [{ id: 'c1', name: 'Test Course' }]

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await CourseService.get()

      expect(Api.get).toHaveBeenCalledWith('/course', undefined)
      expect(!isApiError(result) && result.data).toEqual(mockData)
    })

    test('should handle error response', async () => {
      const mockError = { error: { id: 'ERROR', statusCode: 500 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await CourseService.get()

      expect(isApiError(result) && result.error).toEqual(mockError.error)
    })
  })

  describe('getById', () => {
    test('should fetch course by ID', async () => {
      const mockId = 'c1'
      const mockData = { id: mockId, name: 'Test Course' }

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await CourseService.getById(mockId)

      expect(Api.get).toHaveBeenCalledWith(`/course/${mockId}`)
      expect(!isApiError(result) && result.data).toEqual(mockData)
    })

    test('should handle not found error', async () => {
      const mockId = 'nonexistent'
      const mockError = { error: { id: 'NOT_FOUND', statusCode: 404 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await CourseService.getById(mockId)

      expect(isApiError(result) && result.error).toEqual(mockError.error)
    })
  })

  describe('getMaterialContent', () => {
    test('should fetch material content by course and content IDs', async () => {
      const mockCourseId = 'c1'
      const mockContentId = 'content1'
      const mockData = {
        id: mockContentId,
        content: { type: 'doc', content: [] }
      }

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await CourseService.getMaterialContent(
        mockCourseId,
        mockContentId
      )

      expect(Api.get).toHaveBeenCalledWith(
        `/course/${mockCourseId}/content/${mockContentId}`
      )
      expect(!isApiError(result) && result.data).toEqual(mockData)
    })
  })

  describe('create', () => {
    test('should create a new course', async () => {
      const mockCourse: PossiblyUnsavedCourse = {
        _key: 'temp-key',
        _entityName: 'Course',
        name: 'New Course',
        startDate: new Date(),
        endDate: new Date(),
        description: 'Course description',
        thumbnailId: null,
        subjectId: 's1',
        chapters: []
      }
      const mockResponse = { id: 'new-course-id' }

      ;(Api.post as Mock).mockResolvedValue({ data: mockResponse })

      const result = await CourseService.create(mockCourse)

      expect(Api.post).toHaveBeenCalledWith('/course', mockCourse)
      expect(!isApiError(result) && result.data).toEqual(mockResponse)
    })
  })

  describe('update', () => {
    test('should update a course using JSON patch', async () => {
      const mockId = 'c1'
      const mockPatch = [
        { op: 'replace', path: '/name', value: 'Updated Course Name' }
      ]

      ;(Api.patch as Mock).mockResolvedValue({})

      await CourseService.update(mockId, mockPatch as any)

      expect(Api.patch).toHaveBeenCalledWith(`/course/${mockId}`, mockPatch)
    })

    test('should handle update with multiple operations', async () => {
      const mockId = 'c1'
      const mockPatch = [
        { op: 'replace', path: '/name', value: 'New Name' },
        { op: 'replace', path: '/description', value: 'New Description' }
      ]

      ;(Api.patch as Mock).mockResolvedValue({})

      await CourseService.update(mockId, mockPatch as any)

      expect(Api.patch).toHaveBeenCalledWith(`/course/${mockId}`, mockPatch)
    })
  })

  describe('createMaterialContent', () => {
    test('should create course material content', async () => {
      const mockContent = {
        _key: 'temp-key',
        _entityName: 'CourseMaterialContent',
        content: { type: 'doc', content: [] },
        nooTubeVideos: [],
        medias: [],
        workAssignments: []
      }
      const mockResponse = { id: 'new-content-id' }

      ;(Api.post as Mock).mockResolvedValue({ data: mockResponse })

      const result = await CourseService.createMaterialContent(
        mockContent as any
      )

      expect(Api.post).toHaveBeenCalledWith(
        '/course/material-content',
        mockContent
      )
      expect(!isApiError(result) && result.data).toEqual(mockResponse)
    })
  })

  describe('updateMaterialContent', () => {
    test('should update material content using JSON patch', async () => {
      const mockContentId = 'content1'
      const mockPatch = [
        {
          op: 'replace',
          path: '/content',
          value: { type: 'doc', content: [] }
        }
      ]

      ;(Api.patch as Mock).mockResolvedValue({})

      await CourseService.updateMaterialContent(mockContentId, mockPatch as any)

      expect(Api.patch).toHaveBeenCalledWith(
        `/course/material-content/${mockContentId}`,
        mockPatch
      )
    })
  })

  describe('getMemberships', () => {
    test('should fetch course memberships with pagination', async () => {
      const query = new URLSearchParams()
      query.append('page', '1')
      query.append('perPage', '10')

      const mockPagination: IPagination = {
        page: 1,
        pageSize: 10,
        toQuery: () => query
      }
      const mockData = [
        { id: 'm1', courseId: 'c1', studentId: 's1', isActive: true }
      ]

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await CourseService.getMemberships(mockPagination)

      expect(Api.get).toHaveBeenCalledWith(
        '/course/membership',
        expect.any(URLSearchParams)
      )

      const params = (Api.get as Mock).mock.calls[0]?.[1] as URLSearchParams

      expect(params.get('page')).toBe('1')
      expect(params.get('perPage')).toBe('10')
      expect(!isApiError(result) && result.data).toEqual(mockData)
    })

    test('should fetch memberships without pagination', async () => {
      const mockData = [
        { id: 'm1', courseId: 'c1', studentId: 's1', isActive: true }
      ]

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await CourseService.getMemberships()

      expect(Api.get).toHaveBeenCalledWith('/course/membership', undefined)
      expect(!isApiError(result) && result.data).toEqual(mockData)
    })
  })

  describe('createMembership', () => {
    test('should create a course membership', async () => {
      const mockMembership: CreateCourseMembershipPayload = {
        studentId: 's1',
        courseId: 'c1',
        notifyStudent: true
      }
      const mockResponse = {
        id: 'new-membership-id',
        courseId: 'c1',
        studentId: 's1',
        isActive: true,
        isArchived: false,
        type: 'manual-assigned' as const,
        _entityName: 'CourseMembership',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(Api.post as Mock).mockResolvedValue({ data: mockResponse })

      const result = await CourseService.createMembership(mockMembership)

      expect(Api.post).toHaveBeenCalledWith(
        '/course/membership',
        mockMembership
      )
      expect(!isApiError(result) && result.data).toEqual(mockResponse)
    })

    test('should create membership without notification', async () => {
      const mockMembership: CreateCourseMembershipPayload = {
        studentId: 's1',
        courseId: 'c1',
        notifyStudent: false
      }

      ;(Api.post as Mock).mockResolvedValue({ data: { id: 'membership-id' } })

      await CourseService.createMembership(mockMembership)

      expect(Api.post).toHaveBeenCalledWith(
        '/course/membership',
        mockMembership
      )
    })
  })

  describe('deleteMembership', () => {
    test('should delete a course membership', async () => {
      const mockMembershipId = 'm1'

      ;(Api.delete as Mock).mockResolvedValue({})

      await CourseService.deleteMembership(mockMembershipId)

      expect(Api.delete).toHaveBeenCalledWith(
        `/course/membership/${mockMembershipId}`
      )
    })
  })

  describe('delete', () => {
    test('should delete a course', async () => {
      const mockId = 'c1'

      ;(Api.delete as Mock).mockResolvedValue({})

      await CourseService.delete(mockId)

      expect(Api.delete).toHaveBeenCalledWith(`/course/${mockId}`)
    })

    test('should handle delete error', async () => {
      const mockId = 'c1'
      const mockError = { error: { id: 'FORBIDDEN', statusCode: 403 } }

      ;(Api.delete as Mock).mockResolvedValue(mockError)

      const result = await CourseService.delete(mockId)

      expect(isApiError(result) && result.error).toEqual(mockError.error)
    })
  })
})
