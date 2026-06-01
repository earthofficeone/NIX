import jsQR from 'jsqr'
import {
  isEmvQrPayload,
  parseEmvQrPayload,
  parseSlipVerifyPayload,
  slipVerifyTitle,
} from '@/utils/thaiQr'

export type SlipQrParseStatus = 'success' | 'no_qr' | 'invalid_qr'
export type SlipQrKind = 'payment' | 'slip_verify'

export interface SlipQrParseResult {
  status: SlipQrParseStatus
  kind?: SlipQrKind
  amount?: number
  title?: string
  note?: string
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('โหลดรูปไม่สำเร็จ'))
    img.src = dataUrl
  })
}

function decodeQrFromImage(img: HTMLImageElement): string | null {
  const baseW = img.naturalWidth || img.width
  const baseH = img.naturalHeight || img.height
  if (!baseW || !baseH) return null

  const scaleFactors = [1, 1.25, 1.5, 0.75, 2]
  for (const factor of scaleFactors) {
    const w = Math.min(Math.max(1, Math.floor(baseW * factor)), 2400)
    const h = Math.min(Math.max(1, Math.floor(baseH * factor)), 2400)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) continue
    ctx.drawImage(img, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)
    const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' })
    if (code?.data) return code.data
  }
  return null
}

function parsePaymentQr(raw: string): SlipQrParseResult | null {
  if (!isEmvQrPayload(raw)) return null

  const fields = parseEmvQrPayload(raw)
  if (fields.amount == null && !fields.merchantName) return null

  const noteParts: string[] = []
  if (fields.billNumber) noteParts.push(`เลขที่: ${fields.billNumber}`)
  if (fields.transactionRef) noteParts.push(`อ้างอิง: ${fields.transactionRef}`)

  return {
    status: 'success',
    kind: 'payment',
    amount: fields.amount,
    title: fields.merchantName,
    note: noteParts.length > 0 ? noteParts.join('\n') : undefined,
  }
}

function parseBankSlipVerifyQr(raw: string): SlipQrParseResult | null {
  const fields = parseSlipVerifyPayload(raw)
  if (!fields) return null

  const noteParts: string[] = []
  if (fields.transactionRef) noteParts.push(`เลขที่รายการ: ${fields.transactionRef}`)

  return {
    status: 'success',
    kind: 'slip_verify',
    title: slipVerifyTitle(fields),
    note: noteParts.length > 0 ? noteParts.join('\n') : undefined,
  }
}

/** Decode QR from a data URL and map Thai slip / PromptPay / Slip Verify fields. */
export async function parseSlipFromDataUrl(dataUrl: string): Promise<SlipQrParseResult> {
  const img = await loadImage(dataUrl)
  const raw = decodeQrFromImage(img)
  if (!raw) return { status: 'no_qr' }

  const payment = parsePaymentQr(raw)
  if (payment) return payment

  const slipVerify = parseBankSlipVerifyQr(raw)
  if (slipVerify) return slipVerify

  return { status: 'invalid_qr' }
}
