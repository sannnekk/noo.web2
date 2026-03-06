import { describe, expect, test } from 'vitest'
import { useEntityDrafts } from './useEntityDrafts'

describe('useEntityDrafts', () => {
  test('tracks dirty updates for existing draft', () => {
    const entityDrafts = useEntityDrafts<{
      _entityName: 'TestEntity'
      _key: string
      title: string
    }>()

    const entity = {
      _entityName: 'TestEntity' as const,
      _key: '1',
      title: 'Before'
    }

    entityDrafts.setDraft('material-1', entity)
    entity.title = 'After'

    expect(entityDrafts.countChanges('material-1')).toBeGreaterThan(0)
    expect(entityDrafts.hasChanges('material-1')).toBe(true)
    expect(entityDrafts.hasAnyChanges.value).toBe(true)
  })

  test('treats new draft and deleted draft as changed', () => {
    const entityDrafts = useEntityDrafts<{
      _entityName: 'TestEntity'
      _key: string
      title: string
    }>()

    entityDrafts.setDraft(
      'material-1',
      {
        _entityName: 'TestEntity',
        _key: '1',
        title: 'New'
      },
      { isNew: true }
    )

    expect(entityDrafts.hasChanges('material-1')).toBe(true)

    entityDrafts.markDeleted('material-1')

    expect(entityDrafts.hasChanges('material-1')).toBe(true)
    expect(entityDrafts.countChanges('material-1')).toBe(0)
  })

  test('resets baseline after save', () => {
    const entityDrafts = useEntityDrafts<{
      _entityName: 'TestEntity'
      _key: string
      title: string
    }>()

    const entity = {
      _entityName: 'TestEntity' as const,
      _key: '1',
      title: 'Before'
    }

    entityDrafts.setDraft('material-1', entity, { isNew: true })
    entity.title = 'After'

    expect(entityDrafts.hasChanges('material-1')).toBe(true)

    entityDrafts.resetDraftBaseline('material-1')

    expect(entityDrafts.countChanges('material-1')).toBe(0)
    expect(entityDrafts.hasChanges('material-1')).toBe(false)
  })
})
