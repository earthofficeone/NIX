const IMAGE_MAX_BYTES = 3 * 1024 * 1024
const FILE_MAX_BYTES = 5 * 1024 * 1024

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'))
    reader.readAsDataURL(file)
  })
}

export async function readImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('กรุณาเลือกไฟล์รูปภาพ')
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error('รูปภาพต้องไม่เกิน 3 MB')
  }
  return readFileAsDataUrl(file)
}

export async function readAttachmentFile(file: File): Promise<string> {
  if (file.size > FILE_MAX_BYTES) {
    throw new Error('ไฟล์ต้องไม่เกิน 5 MB')
  }
  return readFileAsDataUrl(file)
}
