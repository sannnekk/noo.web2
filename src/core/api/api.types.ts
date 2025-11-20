export interface ApiEntity<TName extends string> {
  _entityName: TName
  id: string
  createdAt: Date
  updatedAt: Date | null
}
