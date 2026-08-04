import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  clearDraft,
  DRAFT_TTL_MS,
  readDraft,
  saveDraft
} from './participation.storage'

describe('participation storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useRealTimers()
  })

  test('should round-trip a draft, dates included', () => {
    const date = new Date('2026-08-04T10:00:00.000Z')

    saveDraft('poll-1', { 'question-1': 'Ответ', 'question-2': date })

    expect(readDraft('poll-1')).toEqual({
      'question-1': 'Ответ',
      'question-2': date
    })
  })

  test('should keep the drafts of different polls apart', () => {
    saveDraft('poll-1', { 'question-1': 'Первый' })
    saveDraft('poll-2', { 'question-1': 'Второй' })

    expect(readDraft('poll-1')).toEqual({ 'question-1': 'Первый' })
    expect(readDraft('poll-2')).toEqual({ 'question-1': 'Второй' })
  })

  test('should not hand the draft of one user to another', () => {
    saveDraft('poll-1', { 'question-1': 'Ответ Ани' }, 'user-1')

    expect(readDraft('poll-1', 'user-2')).toBeNull()
    expect(readDraft('poll-1')).toBeNull()
    expect(readDraft('poll-1', 'user-1')).toEqual({
      'question-1': 'Ответ Ани'
    })
  })

  test('should clear the draft of the owner it is given', () => {
    saveDraft('poll-1', { 'question-1': 'Ответ Ани' }, 'user-1')
    saveDraft('poll-1', { 'question-1': 'Ответ Бори' }, 'user-2')

    clearDraft('poll-1', 'user-1')

    expect(readDraft('poll-1', 'user-1')).toBeNull()
    expect(readDraft('poll-1', 'user-2')).toEqual({
      'question-1': 'Ответ Бори'
    })
  })

  test('should read a draft of an untouched poll as missing', () => {
    expect(readDraft('poll-1')).toBeNull()
  })

  test('should forget a draft once its lifetime has passed', () => {
    vi.useFakeTimers()

    saveDraft('poll-1', { 'question-1': 'Ответ' })
    vi.advanceTimersByTime(DRAFT_TTL_MS + 1)

    expect(readDraft('poll-1')).toBeNull()
  })

  test('should restart the lifetime on every save', () => {
    vi.useFakeTimers()

    saveDraft('poll-1', { 'question-1': 'Ответ' })
    vi.advanceTimersByTime(DRAFT_TTL_MS - 1)
    saveDraft('poll-1', { 'question-1': 'Ответ подлиннее' })
    vi.advanceTimersByTime(DRAFT_TTL_MS - 1)

    expect(readDraft('poll-1')).toEqual({ 'question-1': 'Ответ подлиннее' })
  })

  test('clearDraft should drop the draft', () => {
    saveDraft('poll-1', { 'question-1': 'Ответ' })
    clearDraft('poll-1')

    expect(readDraft('poll-1')).toBeNull()
  })
})
