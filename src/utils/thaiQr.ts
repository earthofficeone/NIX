/** Parsed fields from Thai PromptPay / EMVCo QR (BOT standard TLV). */
export interface EmvQrFields {
  amount?: number
  merchantName?: string
  billNumber?: string
  transactionRef?: string
}

export function parseTlv(data: string): Record<string, string> {
  const out: Record<string, string> = {}
  let i = 0
  while (i + 4 <= data.length) {
    const id = data.slice(i, i + 2)
    const len = Number.parseInt(data.slice(i + 2, i + 4), 10)
    i += 4
    if (Number.isNaN(len) || len < 0 || i + len > data.length) break
    out[id] = data.slice(i, i + len)
    i += len
  }
  return out
}

function parseNestedBillInfo(tag62: string): Pick<EmvQrFields, 'billNumber' | 'transactionRef'> {
  const nested = parseTlv(tag62)
  const result: Pick<EmvQrFields, 'billNumber' | 'transactionRef'> = {}
  if (nested['01']) result.billNumber = nested['01'].trim()
  if (nested['05']) result.transactionRef = nested['05'].trim()
  return result
}

/** Parse EMVCo payload string (usually starts with 000201). */
export function parseEmvQrPayload(payload: string): EmvQrFields {
  const tags = parseTlv(payload)
  const result: EmvQrFields = {}

  if (tags['54']) {
    const amt = Number.parseFloat(tags['54'])
    if (!Number.isNaN(amt) && amt > 0) result.amount = amt
  }

  if (tags['59']) {
    result.merchantName = tags['59'].trim()
  }

  if (tags['62']) {
    Object.assign(result, parseNestedBillInfo(tags['62']))
  }

  return result
}

export function isEmvQrPayload(payload: string): boolean {
  return payload.startsWith('000201')
}

/** BOT Slip Verify Mini-QR (printed on transfer slips, e.g. K-Plus). */
export interface SlipVerifyFields {
  sendingBank?: string
  transactionRef?: string
}

const BOT_BANK_NAMES: Record<string, string> = {
  '002': 'ธ.กรุงเทพ',
  '004': 'ธ.กสิกรไทย',
  '006': 'ธ.กรุงไทย',
  '011': 'ธ.ทหารไทยธนชาต',
  '014': 'ธ.ไทยพาณิชย์',
  '025': 'ธ.กรุงศรีอยุธยา',
  '030': 'ธ.ออมสิน',
  '034': 'ธ.เพื่อสังคม',
  '069': 'ธ.เกียรตินาคินภัทร',
  '073': 'ธ.แลนด์ แอนด์ เฮ้าส์',
}

export function bankNameFromBotCode(code: string | undefined): string | undefined {
  if (!code) return undefined
  return BOT_BANK_NAMES[code]
}

/**
 * Parse Slip Verify QR (tag 00 nested: API 000001, bank code, trans ref).
 * Does not include amount — only reference for bank verification APIs.
 */
export function parseSlipVerifyPayload(payload: string): SlipVerifyFields | null {
  const root = parseTlv(payload)
  const rootTemplate = root['00']
  if (!rootTemplate) return null

  const inner = parseTlv(rootTemplate)
  const apiMarker = inner['00']
  const transRef = inner['02']?.trim()

  if (!transRef || transRef.length < 8) return null

  if (apiMarker === '000001') {
    return {
      sendingBank: inner['01']?.trim(),
      transactionRef: transRef,
    }
  }

  if (apiMarker === '01' && inner['01'] === '01') {
    return { transactionRef: transRef }
  }

  if (inner['01'] && /^\d{3}$/.test(inner['01'])) {
    return {
      sendingBank: inner['01'],
      transactionRef: transRef,
    }
  }

  return null
}

export function slipVerifyTitle(fields: SlipVerifyFields): string | undefined {
  const bank = bankNameFromBotCode(fields.sendingBank)
  return bank ? `โอนผ่าน${bank}` : undefined
}
