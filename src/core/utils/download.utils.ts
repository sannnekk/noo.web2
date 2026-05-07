export async function triggerDownload(
  url: string,
  fileName: string
): Promise<void> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Не удалось загрузить файл (${response.status})`)
  }

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)

  try {
    const link = document.createElement('a')

    link.href = blobUrl
    link.download = fileName
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}
