import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, X, ArrowLeft, Image } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api, mediaUrl } from '../lib/api'

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Graduation', "Valentine's Day", "Mother's Day", 'Sympathy', 'Congratulations', 'Get Well Soon', 'Thank You', 'Other']
const COLORS = ['Red', 'Pink', 'White', 'Yellow', 'Purple', 'Orange', 'Blue', 'Mixed', 'Pastel', 'Custom']
const INVENTORY_OPTIONS = []

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const toast = useToast()
  const isEdit = !!id && id !== 'new'

  const [form, setForm] = useState({
    name: '',
    description: '',
    preparation_time_minutes: '',
    is_available: true,
    is_featured: false,
    occasions: [],
    colors: [],
    sizes: [],
    required_materials: [],
  })

  const [images, setImages] = useState([])
  const [loadingProduct, setLoadingProduct] = useState(isEdit)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const [newSize, setNewSize] = useState({ label: '', price: '' })
  const [newMaterial, setNewMaterial] = useState({ item: '', quantity: '' })

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    api.getProduct(id)
      .then((res) => {
        if (cancelled) return
        const product = res.data || {}
        const gallery = product.images?.length
          ? product.images
          : (product.primary_image_url ? [product.primary_image_url] : [])
        setImages(gallery)
        setForm({
          name: product.name || '',
          description: product.description || '',
          preparation_time_minutes: product.preparation_time_minutes ?? '',
          is_available: product.is_available !== false,
          is_featured: !!product.is_featured,
          occasions: product.occasions?.length ? product.occasions : (product.category ? [product.category] : []),
          colors: [],
          sizes: product.sizes?.length ? product.sizes.map((s) => ({ label: s.label, price: s.price })) : [],
          required_materials: [],
        })
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Could not load this arrangement')
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false)
      })
    return () => { cancelled = true }
  }, [id, isEdit])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleOccasion(occ) {
    set('occasions', form.occasions.includes(occ) ? form.occasions.filter((o) => o !== occ) : [...form.occasions, occ])
  }

  function toggleColor(color) {
    set('colors', form.colors.includes(color) ? form.colors.filter((c) => c !== color) : [...form.colors, color])
  }

  function addSize() {
    if (!newSize.label || !newSize.price) return toast.error('Fill in size label and price')
    set('sizes', [...form.sizes, { ...newSize, price: Number(newSize.price) }])
    setNewSize({ label: '', price: '' })
  }

  function removeSize(i) {
    set('sizes', form.sizes.filter((_, idx) => idx !== i))
  }

  function addMaterial() {
    if (!newMaterial.item) return toast.error('Select an inventory item')
    set('required_materials', [...form.required_materials, { ...newMaterial, quantity: Number(newMaterial.quantity) || 1 }])
    setNewMaterial({ item: '', quantity: '' })
  }

  async function handleUpload(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const res = await api.uploadImage(file)
        if (!res.url) throw new Error('Upload did not return a photo URL')
        uploaded.push(res.url)
      }
      setImages((prev) => [...prev, ...uploaded])
      toast.success(uploaded.length > 1 ? 'Photos uploaded' : 'Photo uploaded')
    } catch (err) {
      toast.error(err.message || 'Could not upload the photo')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Product name is required')
    const sizes = form.sizes
      .filter((s) => String(s.label || '').trim() && s.price !== '' && !Number.isNaN(Number(s.price)))
      .map((s) => ({ label: String(s.label).trim(), price: Number(s.price) }))
    if (sizes.length === 0) return toast.error('Add at least one size and price')
    if (images.length === 0) return toast.error('Upload a photo so it shows on mobile')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.occasions[0] || 'flower',
      preparation_time_minutes: Number(form.preparation_time_minutes) || 45,
      is_available: form.is_available,
      is_featured: form.is_featured,
      primary_image_url: images[0],
      images,
      sizes,
    }

    setSaving(true)
    try {
      if (isEdit) await api.updateProduct(id, payload)
      else await api.createProduct(payload)
      toast.success(isEdit ? 'Arrangement updated. It is on the mobile catalog.' : 'Arrangement saved. It is on the mobile catalog.')
      navigate('/products')
    } catch (err) {
      toast.error(err.message || 'Could not save the arrangement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/products')}><ArrowLeft size={18} /></button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Arrangement' : 'New Arrangement'}</h1>
            <p className="page-subtitle">{isEdit ? `Editing: ${form.name}` : 'Create a new floral arrangement'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/products')}>Discard</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading || loadingProduct}>
            {saving ? 'Saving…' : 'Save Arrangement'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Basic Info */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Basic Information</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Arrangement Name <span className="required">*</span></label>
                <input className="form-input" placeholder="e.g. Classic Red Bouquet" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} placeholder="Describe the arrangement..." value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Preparation Time (minutes)</label>
                <input type="number" className="form-input" min="0" placeholder="60" value={form.preparation_time_minutes} onChange={(e) => set('preparation_time_minutes', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Product Images</h3></div>
            <div className="card-body">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={handleUpload}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {images.map((url, i) => (
                  <div key={url} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: 'var(--color-bg)' }}>
                    <img src={mediaUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 0 && (
                      <span style={{ position: 'absolute', left: 6, bottom: 6, background: 'var(--color-rose)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 999 }}>Cover</span>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.9)' }}
                      onClick={() => setImages((prev) => prev.filter((item) => item !== url))}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div style={{
                  aspectRatio: '1', background: 'var(--color-bg)', borderRadius: 12,
                  border: '2px dashed var(--color-border)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  flexDirection: 'column', gap: '0.5rem',
                  gridColumn: images.length ? undefined : '1 / -1',
                  height: images.length ? undefined : 160,
                }} onClick={() => !uploading && fileRef.current?.click()}>
                  <Image size={28} style={{ color: 'var(--color-border)' }} />
                  <span className="text-xs text-muted">{uploading ? 'Uploading…' : 'Click to upload image'}</span>
                </div>
              </div>
              <p className="text-xs text-muted" style={{ margin: '0.75rem 0 0' }}>JPG, PNG, or WebP. The first photo is the one buyers see on mobile.</p>
            </div>
          </div>

          {/* Sizes & Prices */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Sizes & Prices</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {form.sizes.map((size, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <span className="font-semibold">{size.label}</span>
                  </div>
                  <span className="font-semibold text-rose">{formatCurrency(size.price)}</span>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeSize(i)}><X size={14} /></button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Size Label</label>
                  <input className="form-input" placeholder="e.g. Small, Medium" value={newSize.label} onChange={(e) => setNewSize({ ...newSize, label: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (PHP)</label>
                  <input type="number" className="form-input" placeholder="0.00" min="0" value={newSize.price} onChange={(e) => setNewSize({ ...newSize, price: e.target.value })} />
                </div>
                <button className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={addSize}><Plus size={16} /> Add</button>
              </div>
            </div>
          </div>

          {/* Required Materials */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Required Materials / Flowers</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {form.required_materials.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 10 }}>
                  <span style={{ flex: 1 }} className="font-semibold">{m.item}</span>
                  <span className="text-muted text-sm">× {m.quantity}</span>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => set('required_materials', form.required_materials.filter((_, idx) => idx !== i))}><X size={14} /></button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Inventory Item</label>
                  <select className="form-select" value={newMaterial.item} onChange={(e) => setNewMaterial({ ...newMaterial, item: e.target.value })}>
                    <option value="">— Select item —</option>
                    {INVENTORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" min="1" placeholder="1" value={newMaterial.quantity} onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })} />
                </div>
                <button className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={addMaterial}><Plus size={16} /> Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Status</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <div style={{
                  width: 40, height: 22, borderRadius: 999,
                  background: form.is_available ? 'var(--color-rose)' : 'var(--color-border)',
                  position: 'relative', transition: 'background 0.2s',
                  cursor: 'pointer',
                }} onClick={() => set('is_available', !form.is_available)}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2, left: form.is_available ? 20 : 2,
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <span className="font-semibold text-sm">Available for Purchase</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <div style={{
                  width: 40, height: 22, borderRadius: 999,
                  background: form.is_featured ? '#f59e0b' : 'var(--color-border)',
                  position: 'relative', transition: 'background 0.2s',
                  cursor: 'pointer',
                }} onClick={() => set('is_featured', !form.is_featured)}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2, left: form.is_featured ? 20 : 2,
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <span className="font-semibold text-sm">Featured Arrangement</span>
              </label>
            </div>
          </div>

          {/* Occasions */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Occasions</h3></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    className="btn btn-sm"
                    style={{
                      background: form.occasions.includes(occ) ? 'var(--color-rose)' : 'var(--color-bg)',
                      color: form.occasions.includes(occ) ? '#fff' : 'var(--color-ink)',
                      border: `1.5px solid ${form.occasions.includes(occ) ? 'var(--color-rose)' : 'var(--color-border)'}`,
                    }}
                    onClick={() => toggleOccasion(occ)}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Available Colors</h3></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className="btn btn-sm"
                    style={{
                      background: form.colors.includes(color) ? 'var(--color-ink)' : 'var(--color-bg)',
                      color: form.colors.includes(color) ? '#fff' : 'var(--color-ink)',
                      border: `1.5px solid ${form.colors.includes(color) ? 'var(--color-ink)' : 'var(--color-border)'}`,
                    }}
                    onClick={() => toggleColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
