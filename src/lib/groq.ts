import { CATEGORIES } from '../data/mock'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'qwen/qwen3.6-27b'

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

/** Low-level call: send a prompt + image to Groq's vision model, return parsed JSON. */
async function groqVisionJSON(
  prompt: string,
  dataUrl: string,
  maxTokens = 2048,
): Promise<unknown> {
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
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Groq request failed (${res.status}). ${text.slice(0, 200)}`)
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = json.choices?.[0]?.message?.content ?? '{}'
  try {
    return JSON.parse(content)
  } catch {
    const m = content.match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : {}
  }
}

/** Send the bill image to Groq's Qwen3.6 vision model and parse the result. */
export async function scanBill(dataUrl: string): Promise<ScanResult> {
  const parsed = await groqVisionJSON(PROMPT, dataUrl)
  const result = coerceResult(parsed)
  if (result.items.length === 0) {
    throw new Error(
      'No line items could be read from this image. Try a clearer photo of the bill.',
    )
  }
  return result
}

/* ---------------- single-product recognition (inventory) ---------------- */

export type ProductGuess = {
  name: string
  brand: string
  category: string
  unit: string
  price: number // MRP in ₹ if visible, else 0
  emoji: string
}

const PRODUCT_PROMPT = `You are an expert at identifying Indian grocery / kirana retail products from a photo of the item or its packaging.

Identify the SINGLE main product in the image. Respond with ONLY a JSON object (no markdown, no commentary) matching exactly this shape:

{
  "name": string,        // clean product name incl. size/variant, e.g. "Maggi 2-Min Masala 70g"
  "brand": string,       // brand, e.g. "Nestlé" (or "" if unclear)
  "category": string,    // ONE of: ${CATEGORIES.join(', ')}
  "unit": string,        // one of: pack, bottle, pouch, box, jar, tin, bar, tube, bag, kg, pc
  "price": number,       // printed MRP in INR if visible on the pack, else 0
  "emoji": string        // one relevant emoji for the product
}

Rules:
- Read the printed MRP if you can see it; otherwise use 0.
- Include the pack size in the name when visible (e.g. "500ml", "1kg").
- If no product is recognisable, return {"name":"","brand":"","category":"Staples","unit":"pc","price":0,"emoji":"📦"}.`

const UNITS = ['pack', 'bottle', 'pouch', 'box', 'jar', 'tin', 'bar', 'tube', 'bag', 'kg', 'pc']

export async function scanProduct(dataUrl: string): Promise<ProductGuess> {
  const raw = (await groqVisionJSON(PRODUCT_PROMPT, dataUrl, 512)) as Record<
    string,
    unknown
  >
  const category = normalizeCategory(String(raw.category ?? ''))
  const name = String(raw.name ?? '').trim()
  if (!name) {
    throw new Error(
      "Couldn't recognise a product in that photo. Try a clearer, closer shot of the pack.",
    )
  }
  const unitRaw = String(raw.unit ?? '').toLowerCase().trim()
  const emoji =
    typeof raw.emoji === 'string' && raw.emoji.trim()
      ? raw.emoji.trim()
      : (EMOJI_BY_CATEGORY[category] ?? '📦')
  return {
    name,
    brand: String(raw.brand ?? '').trim(),
    category,
    unit: UNITS.includes(unitRaw) ? unitRaw : 'pc',
    price: Math.max(0, Number(raw.price) || 0),
    emoji,
  }
}
