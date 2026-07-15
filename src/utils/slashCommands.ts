import type { NoteBlockType } from '@/types'

export interface SlashCommand {
  id: string
  label: string
  description: string
  blockType: NoteBlockType
  keywords: string[]
  group: 'basic' | 'list' | 'media'
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'text',
    label: 'ข้อความ',
    description: 'เริ่มเขียนด้วยข้อความธรรมดา',
    blockType: 'paragraph',
    keywords: ['text', 'paragraph', 'ข้อความ', 'txt'],
    group: 'basic',
  },
  {
    id: 'heading1',
    label: 'หัวข้อ 1',
    description: 'หัวข้อใหญ่',
    blockType: 'heading1',
    keywords: ['h1', 'heading1', 'heading', 'หัวข้อ', 'หัวข้อ1'],
    group: 'basic',
  },
  {
    id: 'heading2',
    label: 'หัวข้อ 2',
    description: 'หัวข้อรอง',
    blockType: 'heading2',
    keywords: ['h2', 'heading2', 'หัวข้อ2'],
    group: 'basic',
  },
  {
    id: 'heading3',
    label: 'หัวข้อ 3',
    description: 'หัวข้อย่อย',
    blockType: 'heading3',
    keywords: ['h3', 'heading3', 'หัวข้อ3'],
    group: 'basic',
  },
  {
    id: 'heading4',
    label: 'หัวข้อ 4',
    description: 'หัวข้อเล็ก',
    blockType: 'heading4',
    keywords: ['h4', 'heading4', 'หัวข้อ4'],
    group: 'basic',
  },
  {
    id: 'bullet',
    label: 'รายการหัวข้อย่อย',
    description: 'รายการแบบจุด',
    blockType: 'bullet',
    keywords: ['bullet', 'ul', 'list', 'รายการ', 'จุด'],
    group: 'list',
  },
  {
    id: 'numbered',
    label: 'รายการลำดับเลข',
    description: 'รายการแบบ 1. 2. 3.',
    blockType: 'numbered',
    keywords: ['numbered', 'ol', 'number', 'ลำดับ', 'เลข'],
    group: 'list',
  },
  {
    id: 'code',
    label: 'โค้ด',
    description: 'บล็อกโค้ด',
    blockType: 'code',
    keywords: ['code', 'โค้ด', 'snippet'],
    group: 'basic',
  },
  {
    id: 'quote',
    label: 'คำคม',
    description: 'ข้อความอ้างอิง',
    blockType: 'quote',
    keywords: ['quote', 'คำคม', 'อ้างอิง'],
    group: 'basic',
  },
  {
    id: 'image',
    label: 'รูปภาพ',
    description: 'อัปโหลดรูปภาพ',
    blockType: 'image',
    keywords: ['image', 'img', 'รูป', 'รูปภาพ', 'photo'],
    group: 'media',
  },
  {
    id: 'file',
    label: 'ไฟล์',
    description: 'แนบไฟล์เอกสาร',
    blockType: 'file',
    keywords: ['file', 'attach', 'ไฟล์', 'แนบ'],
    group: 'media',
  },
]

export function filterSlashCommands(query: string): SlashCommand[] {
  const q = query.trim().toLowerCase()
  if (!q) return SLASH_COMMANDS
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q)),
  )
}

export const TEXT_BLOCK_TYPES = new Set<NoteBlockType>([
  'paragraph',
  'heading',
  'heading1',
  'heading2',
  'heading3',
  'heading4',
  'bullet',
  'numbered',
  'code',
  'quote',
])

export function isTextBlockType(type: NoteBlockType): boolean {
  return TEXT_BLOCK_TYPES.has(type)
}

export function headingClass(type: NoteBlockType): string {
  if (type === 'heading') return 'heading1'
  return type
}
