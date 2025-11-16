import { Api } from '@/core/api/api.utils'
import { describe, expect, it, vi } from 'vitest'
import { CalendarService } from './calendar.service'

describe('CalendarService', () => {
  it('delete calls correct endpoint', async () => {
    const spy = vi.spyOn(Api, 'delete').mockResolvedValue({
      data: undefined
    })
    const id = 'e1'
    await CalendarService.delete(id)
    expect(spy).toHaveBeenCalledWith(`/calendar/${id}`)
  })
})
