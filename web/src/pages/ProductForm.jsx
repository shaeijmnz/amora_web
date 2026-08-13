import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus, X, ArrowLeft, Upload, ShoppingCart, Bold, Italic,
  List, Heading, Sparkles, Trash2, CheckCircle2, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Wedding', 'Graduation',
  "Valentine's Day", "Mother's Day", 'Sympathy',
  'Congratulations', 'Get Well Soon', 'Thank You', 'Other',
]

const COLORS = ['Red', 'Pink', 'White', 'Yellow', 'Purple', 'Orange', 'Blue', 'Mixed', 'Pastel']

const COLOR_HEX = {
  Red: '#ef4444', Pink: '#f472b6', White: '#f8fafc', Yellow: '#fbbf24',
  Purple: '#a855f7', Orange: '#f97316', Blue: '#3b82f6', Mixed: 'linear-gradient(135deg, #f472b6, #fbbf24, #3b82f6)',
  Pastel: 'linear-gradient(135deg, #fde8f0, #fef9c3)', Custom: '#9ca3af',
}

// ─── Rich Text Helper Component ────────────────────────────────────────────────
function RichTextEditor({ value, onChange, placeholder }) {
  const textareaRef = useRef(null)
  const [activeTab, setActiveTab] = useState('edit')

  function insertFormatting(prefix, suffix = '') {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end) || 'text'
    const replacement = `${prefix}${selected}${suffix}`
    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    }, 50)
  }

  function renderFormattedText(text) {
    if (!text) return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No description provided.</span>
    
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/### (.*?)\n/g, '<h3 style="font-size:1.1em;font-weight:700;margin:8px 0 4px;color:#111;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/• (.*?)\n/g, '<li style="margin-left:16px;">$1</li>')
      .replace(/\n/g, '<br/>')

    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      {/* Rich Text Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.4rem 0.75rem', background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.5rem', height: 'auto' }}
            title="Bold"
            onClick={() => insertFormatting('**', '**')}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.5rem', height: 'auto' }}
            title="Italic"
            onClick={() => insertFormatting('*', '*')}
          >
            <Italic size={14} />
          </button>

          <div style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 0.25rem' }} />

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.5rem', height: 'auto' }}
            title="Heading 3"
            onClick={() => insertFormatting('### ', '\n')}
          >
            <Heading size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.5rem', height: 'auto' }}
            title="Bullet Item"
            onClick={() => insertFormatting('• ', '\n')}
          >
            <List size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.5rem', height: 'auto', fontSize: '0.75rem', fontWeight: 700 }}
            title="Note Tag"
            onClick={() => insertFormatting('**Note:** ')}
          >
            <Sparkles size={13} style={{ marginRight: 3 }} /> Note
          </button>
        </div>

        {/* Tab switcher: Edit / Preview */}
        <div style={{ display: 'flex', gap: '0.25rem', background: '#fff', borderRadius: 6, padding: 2, border: '1px solid var(--color-border)' }}>
          <button
            type="button"
            style={{
              padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: 4,
              border: 'none', background: activeTab === 'edit' ? 'var(--color-rose)' : 'transparent',
              color: activeTab === 'edit' ? '#fff' : 'var(--color-ink)', cursor: 'pointer'
            }}
            onClick={() => setActiveTab('edit')}
          >
            Write
          </button>
          <button
            type="button"
            style={{
              padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: 4,
              border: 'none', background: activeTab === 'preview' ? 'var(--color-rose)' : 'transparent',
              color: activeTab === 'preview' ? '#fff' : 'var(--color-ink)', cursor: 'pointer'
            }}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Input or Formatted Preview */}
      {activeTab === 'edit' ? (
        <textarea
          ref={textareaRef}
          className="form-textarea"
          rows={4}
          style={{ border: 'none', borderRadius: 0, padding: '0.75rem', outline: 'none', resize: 'vertical' }}
          placeholder={placeholder || 'Describe the arrangement with rich formatting...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div style={{ padding: '0.75rem', minHeight: 100, fontSize: '0.88rem', lineHeight: 1.6 }}>
          {renderFormattedText(value)}
        </div>
      )}
    </div>
  )
}

// ─── Customisation Item Card Component ─────────────────────────────────────────
function CustomisationItemCard({ item, index, onChange, onRemove, onUploadImage }) {
  const itemInputRef = useRef(null)

  return (
    <div style={{
      border: '1px solid #f0f0f0',
      borderRadius: 16,
      background: '#f9fafb',
      padding: '1.25rem',
      display: 'flex',
      gap: '1.25rem',
      alignItems: 'center',
    }}>
      {/* Item Image Upload Box */}
      <input
        ref={itemInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUploadImage(index, file)
        }}
      />
      <div
        onClick={() => itemInputRef.current?.click()}
        style={{
          width: 90,
          height: 90,
          borderRadius: 14,
          border: item.image_url ? 'none' : '1px dashed #d1d5db',
          background: item.image_url
            ? `url(${item.image_url}) center/cover no-repeat`
            : '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {!item.image_url && (
          <>
            <ImageIcon size={22} style={{ color: '#9ca3af', marginBottom: 2 }} />
            <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600 }}>Img</span>
          </>
        )}
      </div>

      {/* Form Fields */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6b7280' }}>
            Item {index + 1}
          </span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
              background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Remove item"
          >
            <X size={16} />
          </button>
        </div>

        {/* Name input */}
        <input
          className="form-input"
          style={{
            background: '#fff', fontSize: '0.9rem', padding: '0.6rem 0.85rem',
            borderRadius: 12, border: '1px solid #e5e7eb'
          }}
          placeholder="Name"
          value={item.name || ''}
          onChange={(e) => onChange(index, 'name', e.target.value)}
        />

        {/* Price & Max Qty inputs row */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="number"
            className="form-input"
            style={{
              background: '#fff', fontSize: '0.9rem', padding: '0.6rem 0.85rem',
              borderRadius: 12, border: '1px solid #e5e7eb', flex: 1
            }}
            placeholder="Price"
            value={item.price ?? ''}
            onChange={(e) => onChange(index, 'price', e.target.value)}
          />
          <input
            type="number"
            className="form-input"
            style={{
              background: '#fff', fontSize: '0.9rem', padding: '0.6rem 0.85rem',
              borderRadius: 12, border: '1px solid #e5e7eb', flex: 1
            }}
            placeholder="Max qty"
            value={item.max_qty ?? ''}
            onChange={(e) => onChange(index, 'max_qty', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Phone Preview ─────────────────────────────────────────────────────────────
function PhonePreview({ form }) {
  const fromPrice = form.sizes.length ? Math.min(...form.sizes.map((s) => Number(s.price) || 0)) : 0
  const images = form.images.length ? form.images : (form.primary_image_url ? [form.primary_image_url] : [])
  const [activeImgIndex, setActiveImgIndex] = useState(0)

  const currentImage = images[activeImgIndex] || form.primary_image_url

  function renderDescriptionHTML(text) {
    if (!text) return 'Fresh pre-order arrangement from Amora Florals.'
    return text
      .replace(/### (.*?)\n/g, '<strong style="display:block;margin-top:4px;">$1</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/• (.*?)\n/g, '• $1<br/>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div style={{ position: 'sticky', top: '1.5rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Preview on Mobile App
      </div>

      {/* Phone frame */}
      <div style={{
        width: 270,
        margin: '0 auto',
        background: '#0f0f14',
        borderRadius: 44,
        padding: '10px 8px',
        boxShadow: '0 0 0 1px #2a2a3a, 0 24px 64px rgba(0,0,0,0.45), inset 0 0 0 1px #3a3a4a',
        position: 'relative',
      }}>
        {/* Dynamic Island / Notch */}
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          width: 90, height: 24, background: '#0f0f14',
          borderRadius: 99, zIndex: 10,
          boxShadow: 'inset 0 0 0 1px #2a2a3a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a2e' }} />
          <div style={{ width: 24, height: 6, borderRadius: 99, background: '#1a1a2e' }} />
        </div>

        {/* Screen */}
        <div style={{
          background: '#fff',
          borderRadius: 36,
          overflow: 'hidden',
          height: 540,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Status bar */}
          <div style={{ height: 36, background: 'transparent', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 18px 4px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: currentImage ? '#fff' : '#111' }}>9:41</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[3, 4, 5].map((h, i) => <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: currentImage ? '#fff' : '#111' }} />)}
              <div style={{ width: 14, height: 8, borderRadius: 2, border: `1.5px solid ${currentImage ? '#fff' : '#111'}`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 1, left: 1, right: 1, bottom: 1, background: currentImage ? '#fff' : '#111', borderRadius: 1 }} />
              </div>
            </div>
          </div>

          {/* Hero image Carousel */}
          <div style={{
            height: 200,
            background: currentImage
              ? `url(${currentImage}) center/cover no-repeat`
              : 'linear-gradient(135deg, #fdf0f3 0%, #f4e8ef 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '4rem', flexShrink: 0,
            position: 'relative',
          }}>
            {!currentImage && '🌸'}

            {/* Carousel navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronRight size={14} />
                </button>

                {/* Dots indicator */}
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      style={{
                        width: idx === activeImgIndex ? 14 : 5,
                        height: 5, borderRadius: 99,
                        background: idx === activeImgIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.2s', cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Back button overlay */}
            <div style={{ position: 'absolute', top: 38, left: 12, width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={12} />
            </div>
          </div>

          {/* Content — scrollable area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 75px' }}>
            {/* Name + rating */}
            <div style={{ marginBottom: 8 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                {form.name || 'Arrangement Name'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} style={{ color: '#f59e0b', fontSize: 10 }}>★</span>
                ))}
                <span style={{ fontSize: 9, color: '#6b7280', marginLeft: 2 }}>4.5 (128 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e11d48', marginBottom: 10 }}>
              {fromPrice > 0 ? formatCurrency(fromPrice) : 'Php. 0.00'}
            </div>

            {/* Formatted Rich Text Description */}
            {form.description && (
              <div style={{ marginBottom: 10, background: '#fafafa', padding: '8px 10px', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                  About {form.name || 'this arrangement'}
                </div>
                <div
                  style={{ fontSize: 9, color: '#4b5563', lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: renderDescriptionHTML(form.description) }}
                />
              </div>
            )}

            {/* Colors */}
            {form.colors.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 5 }}>Choose Color</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {form.colors.map((c, i) => (
                    <div key={c} style={{
                      padding: '2px 7px', borderRadius: 99,
                      border: `1.5px solid ${i === 0 ? '#e11d48' : '#e5e7eb'}`,
                      fontSize: 8.5, fontWeight: 600,
                      color: i === 0 ? '#e11d48' : '#374151',
                      background: i === 0 ? '#fff0f4' : '#fff',
                    }}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {form.sizes.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 5 }}>Choose Size</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {form.sizes.map((s, i) => (
                    <div key={i} style={{
                      padding: '2px 7px', borderRadius: 99,
                      border: `1.5px solid ${i === 0 ? '#e11d48' : '#e5e7eb'}`,
                      fontSize: 8.5, fontWeight: 600,
                      color: i === 0 ? '#e11d48' : '#374151',
                      background: i === 0 ? '#fff0f4' : '#fff',
                    }}>
                      {s.label}{s.price ? ` · ${formatCurrency(Number(s.price))}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customize Add-ons Section */}
            {form.is_customisable && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 5 }}>
                  Customize <span style={{ fontSize: 8.5, color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                  {form.customisation_items.length > 0 ? (
                    form.customisation_items.map((item, idx) => (
                      <div key={idx} style={{
                        border: `1.5px solid ${idx === 0 ? '#e11d48' : '#e5e7eb'}`,
                        borderRadius: 10, padding: 5, textAlign: 'center', background: '#fff',
                      }}>
                        <div style={{
                          height: 38, borderRadius: 6,
                          background: item.image_url ? `url(${item.image_url}) center/cover no-repeat` : '#f3f4f6',
                          marginBottom: 3, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {!item.image_url && <ImageIcon size={14} style={{ color: '#9ca3af' }} />}
                        </div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name || 'Item'}
                        </div>
                        <div style={{ fontSize: 7.5, color: '#e11d48', fontWeight: 600 }}>
                          {item.price ? formatCurrency(Number(item.price)) : ''}
                        </div>
                      </div>
                    ))
                  ) : (
                    ['Paper', 'Basket'].map((box, i) => (
                      <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 4, textAlign: 'center' }}>
                        <div style={{ height: 32, background: '#f3f4f6', borderRadius: 6, marginBottom: 2 }} />
                        <div style={{ fontSize: 7.5, color: '#6b7280' }}>{box}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '8px 12px 12px',
            background: '#fff',
            borderTop: '1px solid #f3f4f6',
            display: 'flex', gap: 6,
          }}>
            <button style={{
              flex: 1, padding: '7px 0', borderRadius: 99,
              border: '1.5px solid #e11d48', background: '#fff',
              color: '#e11d48', fontSize: 9.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              cursor: 'default',
            }}>
              <ShoppingCart size={11} /> Add to Cart
            </button>
            <button style={{
              flex: 1.2, padding: '7px 0', borderRadius: 99,
              border: 'none', background: 'linear-gradient(135deg, #e11d48, #be123c)',
              color: '#fff', fontSize: 9.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              cursor: 'default',
            }}>
              <ShoppingCart size={11} /> Check Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Form Component ───────────────────────────────────────────────────────
export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const toast = useToast()
  const fileInputRef = useRef(null)
  const isEdit = !!id && id !== 'new'

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    is_available: true,
    is_featured: false,
    is_customisable: false,
    customisation_items: [],
    occasions: [],
    colors: [],
    sizes: [{ label: 'Standard', price: '' }],
    primary_image_url: null,
    images: [],
  })

  const [newSize, setNewSize] = useState({ label: '', price: '' })

  // Load existing product on edit
  useEffect(() => {
    if (!isEdit) return
    api.getProduct(id)
      .then((res) => {
        const p = res.data
        const pImages = p.images?.length
          ? p.images
          : (p.primary_image_url ? [p.primary_image_url] : [])

        setForm({
          name: p.name || '',
          description: p.description || '',
          is_available: p.is_available ?? true,
          is_featured: p.is_featured ?? false,
          is_customisable: p.is_customisable ?? false,
          customisation_items: p.customisation_items || [],
          occasions: p.occasions || [],
          colors: [],
          sizes: p.sizes || [{ label: 'Standard', price: '' }],
          primary_image_url: p.primary_image_url || pImages[0] || null,
          images: pImages,
        })
      })
      .catch((e) => toast.error(e.message || 'Failed to load product'))
  }, [id, isEdit])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleOccasion(occ) {
    set('occasions', form.occasions.includes(occ)
      ? form.occasions.filter((o) => o !== occ)
      : [...form.occasions, occ])
  }

  function toggleColor(color) {
    set('colors', form.colors.includes(color)
      ? form.colors.filter((c) => c !== color)
      : [...form.colors, color])
  }

  function addSize() {
    if (!newSize.label || !newSize.price) return toast.error('Fill in size label and price')
    set('sizes', [...form.sizes, { ...newSize, price: Number(newSize.price) }])
    setNewSize({ label: '', price: '' })
  }

  function removeSize(i) {
    set('sizes', form.sizes.filter((_, idx) => idx !== i))
  }

  // Real multiple files upload → Laravel disk storage
  async function handleMultipleFilesChange(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    const uploadedUrls = []

    for (const file of files) {
      try {
        const res = await api.uploadImage(file)
        if (res.url) uploadedUrls.push(res.url)
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`)
      }
    }

    if (uploadedUrls.length) {
      setForm((prev) => {
        const newImages = [...prev.images, ...uploadedUrls]
        return {
          ...prev,
          images: newImages,
          primary_image_url: prev.primary_image_url || newImages[0],
        }
      })
      toast.success(`Uploaded ${uploadedUrls.length} photo(s)!`)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function setPrimaryImage(url) {
    setForm((prev) => ({ ...prev, primary_image_url: url }))
    toast.info('Primary product photo updated')
  }

  function removeImage(indexToRemove) {
    setForm((prev) => {
      const newImages = prev.images.filter((_, idx) => idx !== indexToRemove)
      const primary = prev.primary_image_url === prev.images[indexToRemove]
        ? (newImages[0] || null)
        : prev.primary_image_url
      return {
        ...prev,
        images: newImages,
        primary_image_url: primary,
      }
    })
  }

  // ─── Customisation Items Management ───
  function addCustomisationItem() {
    setForm((prev) => ({
      ...prev,
      customisation_items: [
        ...prev.customisation_items,
        { id: Date.now().toString(), name: '', price: '', max_qty: 1, image_url: '' }
      ]
    }))
  }

  function updateCustomisationItem(index, key, val) {
    setForm((prev) => {
      const updated = [...prev.customisation_items]
      updated[index] = { ...updated[index], [key]: val }
      return { ...prev, customisation_items: updated }
    })
  }

  function removeCustomisationItem(index) {
    setForm((prev) => ({
      ...prev,
      customisation_items: prev.customisation_items.filter((_, idx) => idx !== index)
    }))
  }

  async function handleUploadItemImage(index, file) {
    try {
      const res = await api.uploadImage(file)
      if (res.url) {
        updateCustomisationItem(index, 'image_url', res.url)
        toast.success('Customisation item image uploaded!')
      }
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`)
    }
  }

  async function handleSave() {
    if (!form.name) return toast.error('Product name is required')
    if (form.sizes.length === 0) return toast.error('Add at least one size/price')

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        is_available: form.is_available,
        is_featured: form.is_featured,
        is_customisable: form.is_customisable,
        customisation_items: form.customisation_items.map((item) => ({
          name: item.name,
          price: Number(item.price) || 0,
          max_qty: Number(item.max_qty) || 1,
          image_url: item.image_url || '',
        })),
        primary_image_url: form.primary_image_url || form.images[0] || null,
        images: form.images,
        category: form.occasions[0] || 'flower',
        sizes: form.sizes.map((s) => ({ label: s.label, price: Number(s.price) })),
      }

      if (isEdit) {
        await api.updateProduct(id, payload)
        toast.success('Arrangement updated!')
      } else {
        await api.createProduct(payload)
        toast.success('Arrangement created!')
      }
      navigate('/products')
    } catch (e) {
      toast.error(e.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/products')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Arrangement' : 'New Arrangement'}</h1>
            <p className="page-subtitle">
              {isEdit ? `Editing: ${form.name}` : 'Create a new floral arrangement'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/products')} disabled={saving}>
            Discard
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Arrangement'}
          </button>
        </div>
      </div>

      {/* Two-column layout: form | phone preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '2rem', alignItems: 'start' }}>

        {/* ── LEFT: Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Multiple Photos Upload */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">Product Photos ({form.images.length})</h3>
                <p className="card-subtitle">Upload multiple high-res photos. Click a thumbnail to set as primary cover.</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => !uploading && fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Plus size={14} /> Add Photos
              </button>
            </div>

            <div className="card-body">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleMultipleFilesChange}
              />

              {/* Photo Thumbnails Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {form.images.map((imgUrl, index) => {
                  const isPrimary = form.primary_image_url === imgUrl || (!form.primary_image_url && index === 0)

                  return (
                    <div
                      key={imgUrl + index}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: isPrimary ? '2px solid var(--color-rose)' : '1px solid var(--color-border)',
                        background: `url(${imgUrl}) center/cover no-repeat`,
                        boxShadow: isPrimary ? '0 0 0 2px rgba(225,29,72,0.2)' : 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPrimaryImage(imgUrl)}
                    >
                      {/* Primary Badge */}
                      {isPrimary && (
                        <div style={{
                          position: 'absolute', top: 4, left: 4,
                          background: 'var(--color-rose)', color: '#fff',
                          fontSize: '0.58rem', fontWeight: 800,
                          padding: '0.15rem 0.4rem', borderRadius: 99,
                          display: 'flex', alignItems: 'center', gap: 2,
                        }}>
                          <CheckCircle2 size={10} /> PRIMARY
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                        style={{
                          position: 'absolute', top: 4, right: 4,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.65)', color: '#fff',
                          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title="Remove photo"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )
                })}

                {/* Upload Button Box */}
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: '2px dashed var(--color-border)',
                    background: 'var(--color-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    cursor: uploading ? 'wait' : 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Upload size={22} style={{ color: 'var(--color-muted)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                    {uploading ? 'Uploading…' : '+ Add Photo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information & Rich Text Description */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Basic Information</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Arrangement Name <span className="required">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Classic Red Bouquet"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>

              {/* Rich Text Description Field */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Product Description (Rich Text)</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Supports **bold**, *italics*, lists & headings</span>
                </label>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => set('description', val)}
                  placeholder="Enter detailed arrangement description... Use formatting buttons for bold, list, headings, and highlights."
                />
              </div>
            </div>
          </div>

          {/* Customisation Items Section (Matching wireframe design) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Centered Switch Toggle Row */}
            <div style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              background: '#fff',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', margin: 0 }}>
                <div
                  style={{
                    width: 44, height: 24, borderRadius: 999,
                    background: form.is_customisable ? '#db2777' : '#e5e7eb',
                    position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
                  }}
                  onClick={() => set('is_customisable', !form.is_customisable)}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2, left: form.is_customisable ? 22 : 2,
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>Customisable</span>
              </label>
            </div>

            {/* When Customisable is ON */}
            {form.is_customisable && (
              <>
                {/* Thin horizontal line */}
                <div style={{ height: 1, background: '#f3f4f6', margin: '0 1.5rem' }} />

                {/* Header Row: Title on Left, Add More on Right */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.25rem 1.5rem 1rem',
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, fontFamily: 'serif', color: '#111827' }}>
                    Customisation items
                  </h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{
                      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                      fontSize: '0.82rem', padding: '0.4rem 0.85rem', fontWeight: 600
                    }}
                    onClick={addCustomisationItem}
                  >
                    <Plus size={14} style={{ marginRight: 4 }} /> Add more
                  </button>
                </div>

                {/* Items list */}
                <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {form.customisation_items.length === 0 ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', background: '#f9fafb', borderRadius: 14, border: '1px dashed #e5e7eb' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                        No customisation items added yet. Click <strong>+ Add more</strong> to add item options.
                      </p>
                    </div>
                  ) : (
                    form.customisation_items.map((item, index) => (
                      <CustomisationItemCard
                        key={item.id || index}
                        item={item}
                        index={index}
                        onChange={updateCustomisationItem}
                        onRemove={removeCustomisationItem}
                        onUploadImage={handleUploadItemImage}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sizes & Prices */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Sizes &amp; Prices</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {form.sizes.map((size, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <span className="font-semibold">{size.label}</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--color-rose-dark)' }}>
                    {formatCurrency(Number(size.price))}
                  </span>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeSize(i)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Size Label</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Small, Medium"
                    value={newSize.label}
                    onChange={(e) => setNewSize({ ...newSize, label: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addSize()}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (PHP)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    value={newSize.price}
                    onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addSize()}
                  />
                </div>
                <button className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={addSize}>
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Availability &amp; Visibility</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { field: 'is_available', label: 'Available for Purchase', color: 'var(--color-rose)' },
                { field: 'is_featured', label: 'Featured Arrangement', color: '#f59e0b' },
              ].map(({ field, label, color }) => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <div
                    style={{
                      width: 40, height: 22, borderRadius: 999,
                      background: form[field] ? color : 'var(--color-border)',
                      position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
                    }}
                    onClick={() => set(field, !form[field])}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 2, left: form[field] ? 20 : 2,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  <span className="font-semibold text-sm">{label}</span>
                </label>
              ))}
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
                    type="button"
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
                    type="button"
                    className="btn btn-sm"
                    style={{
                      background: form.colors.includes(color) ? COLOR_HEX[color] || '#374151' : 'var(--color-bg)',
                      color: form.colors.includes(color)
                        ? ['White', 'Yellow', 'Pastel'].includes(color) ? '#374151' : '#fff'
                        : 'var(--color-ink)',
                      border: `1.5px solid ${form.colors.includes(color) ? (COLOR_HEX[color] || '#374151') : 'var(--color-border)'}`,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                    onClick={() => toggleColor(color)}
                  >
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: COLOR_HEX[color] || '#9ca3af',
                      border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0,
                    }} />
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Phone Preview ── */}
        <PhonePreview form={form} />
      </div>
    </div>
  )
}
