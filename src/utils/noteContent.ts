const ALLOWED_TAGS = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'S',
  'STRIKE',
  'A',
  'CODE',
  'SPAN',
  'BR',
])

export function stripHtml(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function isEmptyHtml(html: string): boolean {
  return stripHtml(html) === ''
}

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')

  function walk(node: Node): void {
    const children = [...node.childNodes]
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (!ALLOWED_TAGS.has(el.tagName)) {
          const text = doc.createTextNode(el.textContent ?? '')
          el.replaceWith(text)
          continue
        }
        [...el.attributes].forEach((attr) => {
          if (el.tagName === 'A' && attr.name === 'href') return
          if (el.tagName === 'SPAN' && attr.name === 'style') return
          el.removeAttribute(attr.name)
        })
        if (el.tagName === 'A') {
          const href = el.getAttribute('href') ?? ''
          if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
            el.removeAttribute('href')
          }
        }
        if (el.tagName === 'SPAN') {
          const style = el.getAttribute('style') ?? ''
          const color = style.match(/color:\s*([^;]+)/i)?.[1]?.trim()
          el.removeAttribute('style')
          if (color) el.style.color = color
        }
      }
      walk(child)
    }
  }

  walk(doc.body)
  return doc.body.innerHTML
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
