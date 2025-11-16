import { Api } from '@/core/api/api.utils'
import { describe, expect, it, vi } from 'vitest'
import { CourseService } from './course.service'

describe('CourseService', () => {
  it('getById calls correct endpoint', async () => {
    const spy = vi.spyOn(Api, 'get').mockResolvedValue({ data: { id: 'c1' } })
    const id = 'c1'
    const res = await CourseService.getById(id)
    expect(spy).toHaveBeenCalledWith(`/course/${id}`)
    expect(res.data?.id).toBe('c1')
  })
})
