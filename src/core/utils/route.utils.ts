function getOptionalRouteParam(value: unknown): string | undefined {
  if (value === null || typeof value === 'undefined') {
    return undefined
  }

  const normalized = String(value).trim()

  return normalized.length ? normalized : undefined
}

export { getOptionalRouteParam }
