import { useRef, useState } from 'react'
import Icon from './Icon'
import { CATEGORIES } from '../data/mock'
import { fileToDataUrl, isGroqConfigured, scanProduct } from '../lib/groq'
import './modal.css'

export type ProductFormData = {
  name: string
  brand: string
  emoji: string
  category: string
  price: number
  cost: number
  unit: string
  stock: number
  lowStockAt: number
}

type Props = {
  mode: 'catalog' | 'inventory'
  title?: string
  onClose: () => void
  onSave: (data: ProductFormData) => Promise<void>
}

export default function AddProductModal({
  mode,
  title,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    emoji: '📦',
    category: CATEGORIES[0] as string,
    price: '',
    cost: '',
    stock: '',
    lowStockAt: '',
    unit: 'pc',
  })
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const onImage = async (file?: File) => {
    if (!file) return
    setScanError('')
    setScanning(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      setPhoto(dataUrl)
      const g = await scanProduct(dataUrl)
      setForm((f) => ({
        ...f,
        name: g.name,
        brand: g.brand || f.brand,
        emoji: g.emoji || f.emoji,
        category: g.category,
        unit: g.unit || f.unit,
        price: g.price ? String(g.price) : f.price,
      }))
    } catch (e) {
      setScanError(
        e instanceof Error ? e.message : 'Could not read that photo.',
      )
    } finally {
      setScanning(false)
    }
  }

  const valid = form.name.trim() && Number(form.price) > 0

  const submit = async () => {
    if (!valid) return
    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        brand: form.brand.trim() || '—',
        emoji: form.emoji.trim() || '📦',
        category: form.category,
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        unit: form.unit.trim() || 'pc',
        stock: Math.max(0, Math.round(Number(form.stock) || 0)),
        lowStockAt: Math.max(0, Math.round(Number(form.lowStockAt) || 5)),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="section-title">
            {title ?? (mode === 'catalog' ? 'Add to catalogue' : 'Add a product')}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            <Icon name="close" size={18} />
          </button>
        </div>

        {isGroqConfigured && (
          <div className="scan-product">
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => onImage(e.target.files?.[0])}
            />
            <input
              ref={galleryInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onImage(e.target.files?.[0])}
            />

            {photo ? (
              <div className="sp-preview">
                <img src={photo} alt="product" />
                {scanning && (
                  <div className="sp-scanning">
                    <span className="sp-spin" />
                    Identifying…
                  </div>
                )}
              </div>
            ) : (
              <div className="sp-cta">
                <span className="sp-ic">
                  <Icon name="camera" size={22} />
                </span>
                <div className="sp-copy">
                  <strong>Add by photo</strong>
                  <span>Snap the product — AI fills the details</span>
                </div>
              </div>
            )}

            <div className="sp-actions">
              <button
                type="button"
                className="btn btn-primary sp-btn"
                onClick={() => cameraInput.current?.click()}
                disabled={scanning}
              >
                <Icon name="camera" size={16} />
                {scanning ? 'Scanning…' : 'Camera'}
              </button>
              <button
                type="button"
                className="btn btn-outline sp-btn"
                onClick={() => galleryInput.current?.click()}
                disabled={scanning}
              >
                <Icon name="image" size={16} /> Upload
              </button>
            </div>
            {scanError && <p className="sp-error">{scanError}</p>}
          </div>
        )}

        <div className="modal-body">
          <label className="mf mf-wide">
            <span>Product name *</span>
            <input
              autoFocus
              placeholder="e.g. Maggi 2-Min Noodles"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </label>
          <label className="mf">
            <span>Brand</span>
            <input
              placeholder="Nestlé"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
            />
          </label>
          <label className="mf mf-emoji">
            <span>Emoji</span>
            <input
              value={form.emoji}
              onChange={(e) => set('emoji', e.target.value)}
            />
          </label>
          <label className="mf">
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="mf">
            <span>Unit</span>
            <input
              placeholder="pack / bottle / kg"
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
            />
          </label>
          <label className="mf">
            <span>Sell price (₹) *</span>
            <input
              inputMode="numeric"
              placeholder="14"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </label>
          <label className="mf">
            <span>Cost price (₹)</span>
            <input
              inputMode="numeric"
              placeholder="11"
              value={form.cost}
              onChange={(e) => set('cost', e.target.value)}
            />
          </label>

          {mode === 'inventory' && (
            <>
              <label className="mf">
                <span>Opening stock</span>
                <input
                  inputMode="numeric"
                  placeholder="24"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                />
              </label>
              <label className="mf">
                <span>Reorder at</span>
                <input
                  inputMode="numeric"
                  placeholder="10"
                  value={form.lowStockAt}
                  onChange={(e) => set('lowStockAt', e.target.value)}
                />
              </label>
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={!valid || saving}
          >
            <Icon name="check" size={16} />
            {saving ? 'Saving…' : mode === 'catalog' ? 'Add product' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
