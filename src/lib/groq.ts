import { CATEGORIES } from '../data/mock'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

const groqKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
export const isGroqConfigured = Boolean(groqKey)

export type ScannedItem = {
  name: string
  qty: number
  cost: number
  category: string
  emoji: string
}

export type ScanResult = {
  supplier: string
  date: string
  items: ScannedItem[]
}

const EMOJI_BY_CATEGORY: Record<string, string> = {
  Staples: '🌾',
  Snacks: '🍪',
  Dairy: '🥛',
  Beverages: '🥤',
  'Personal Care': '🧴',
  Household: '🧼',
}

const PROMPT = `You are an expert at reading Indian wholesale supplier invoices and kirana (grocery) shop bills. They may be printed or handwritten, in English or Hindi, possibly crumpled or faded.

Extract EVERY line item from the bill image. Respond with ONLY a JSON object (no markdown, no commentary) matching exactly this shape:

{
  "supplier": string,              // shop/distributor name, or "" if unknown
  "date": string,                  // bill date as "YYYY-MM-DD", or "" if unknown
  "items": [
    {
      "name": string,              // clean, human-readable product name (e.g. "Maggi 2-Min Noodles")
      "qty": number,               // quantity/units purchased (integer, default 1)
      "cost": number,              // per-unit purchase price in INR (number, default 0)
      "category": string,          // ONE of: ${CATEGORIES.join(', ')}
      "emoji": string              // a single relevant emoji for the product
    }
  ]
}

Rules:
- Convert quantities like "2 dozen" to a number (24).
- If a price is a line total, divide by quantity to get per-unit cost.
- Never invent items that are not on the bill.
- If the image is not a bill, return {"supplier":"","date":"","items":[]}.`

function normalizeCategory(c: string): string {
  const match = CATEGORIES.find(
    (cat) => cat.toLowerCase() === (c || '').toLowerCase().trim(),
  )
  return match ?? 'Staples'
}

function coerceResult(raw: unknown): ScanResult {
  const obj = (raw ?? {}) as Record<string, unknown>
  const itemsRaw = Array.isArray(obj.items) ? obj.items : []
  const items: ScannedItem[] = itemsRaw
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>
      const category = normalizeCategory(String(o.category ?? ''))
      const name = String(o.name ?? '').trim()
      const qty = Math.max(0, Math.round(Number(o.qty) || 0)) || 1
      const cost = Math.max(0, Number(o.cost) || 0)
      const emoji =
        typeof o.emoji === 'string' && o.emoji.trim()
          ? o.emoji.trim()
          : (EMOJI_BY_CATEGORY[category] ?? '📦')
      return { name, qty, cost, category, emoji }
    })
    .filter((it) => it.name.length > 0)

  return {
    supplier: String(obj.supplier ?? '').trim() || 'Supplier bill',
    date: String(obj.date ?? '').trim(),
    items,
  }
}

/** Read a File into a base64 data URL for the vision model. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read the image file.'))
    reader.readAsDataURL(file)
  })
}

/** Send the bill image to Groq's Llama-4 Scout vision model and parse the result. */
export async function scanBill(dataUrl: string): Promise<ScanResult> {
  if (!groqKey) {
    throw new Error(
      'Groq API key missing. Add VITE_GROQ_API_KEY to .env.local and restart.',
    )
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `Groq request failed (${res.status}). ${text.slice(0, 200)}`,
    )
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = json.choices?.[0]?.message?.content ?? '{}'

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    // model occasionally wraps JSON in prose — extract the first {...} block
    const m = content.match(/\{[\s\S]*\}/)
    parsed = m ? JSON.parse(m[0]) : {}
  }

  const result = coerceResult(parsed)
  if (result.items.length === 0) {
    throw new Error(
      'No line items could be read from this image. Try a clearer photo of the bill.',
    )
  }
  return result
}
