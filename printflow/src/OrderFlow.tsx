import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react'
import { getSupabaseClient } from './lib/supabase'
import './OrderFlow.css'

type Shop = { id: string; name: string; location: string | null; price_per_page: number | string | null }
type OrderOptions = { copies: number; colour: 'colour' | 'bw'; sides: 'single' | 'double'; paper: 'A4' | 'A3' }
type SavedOrder = { number: string; code: string; status: string }

const steps = ['Upload document', 'Choose print shop', 'Print options', 'Review order']

function contentTypeFor(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    bmp: 'image/bmp',
  }
  return (contentTypes[extension ?? ''] ?? file.type) || 'application/octet-stream'
}

function OrderIcon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const }
  if (name === 'upload') return <svg {...common}><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
  if (name === 'pin') return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
  if (name === 'file') return <svg {...common}><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"/><path d="M13 3v7h7M8 14h8M8 17h5"/></svg>
  if (name === 'check') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>
  return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
}

function OrderHeader() {
  return <header className="order-header"><div className="container order-header-inner"><a className="brand" href="/" aria-label="PrintFlow home"><span className="brand-mark"><span /></span><span>PrintFlow</span></a><a className="order-exit" href="/">Back to home <span aria-hidden="true">↗</span></a></div></header>
}

function Progress({ current }: { current: number }) {
  return <ol className="order-progress" aria-label="Order progress">{steps.map((step, index) => <li className={`${index === current ? 'is-current' : ''} ${index < current ? 'is-complete' : ''}`} key={step}><span className="progress-mark">{index < current ? <OrderIcon name="check" size={13} /> : `0${index + 1}`}</span><span>{step}</span></li>)}</ol>
}

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return <label className="field-label" htmlFor={htmlFor}>{children}</label>
}

function UploadStep({ file, error, onFile }: { file: File | null; error: string; onFile: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.tif,.tiff,.bmp'
  const validate = (candidate?: File) => {
    if (!candidate) return
    const allowed = /\.(pdf|doc|docx|jpe?g|png|gif|webp|tiff?|bmp)$/i.test(candidate.name)
    onFile(allowed ? candidate : null)
  }
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => validate(event.target.files?.[0])
  const dropFile = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); validate(event.dataTransfer.files[0]) }

  return <div className="step-content">
    <div className="order-step-kicker"><span className="order-kicker-dot" /> STEP 1 OF 4</div>
    <h1>Let’s get your document<br /><span>ready to print.</span></h1>
    <p className="step-description">Start by choosing the file you’d like to print. Your document stays on this device during this demo.</p>
    <input ref={inputRef} className="visually-hidden" type="file" accept={accept} onChange={selectFile} aria-label="Choose a document to print" />
    <div className={`upload-dropzone${dragging ? ' is-dragging' : ''}${file ? ' has-file' : ''}`} role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inputRef.current?.click() } }} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={dropFile}>
      <span className="upload-icon"><OrderIcon name={file ? 'file' : 'upload'} size={23} /></span>
      {file ? <><strong>{file.name}</strong><span className="upload-hint">{(file.size / 1024 / 1024).toFixed(2)} MB · Selected for this order</span><button className="replace-file" type="button" onClick={(event) => { event.stopPropagation(); inputRef.current?.click() }}>Choose a different file</button></> : <><strong>Drop your document here</strong><span className="upload-hint">or <span className="browse-link">browse files</span> from your device</span><span className="file-formats">PDF, DOC, DOCX, JPG, PNG, GIF, WEBP, TIFF</span></>}
    </div>
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="privacy-note"><span aria-hidden="true">⌑</span><p><b>Your file stays private.</b> It uploads to private storage only when you place your order.</p></div>
  </div>
}

function ShopStep({ shops, selected, error, loading, loadError, onSelect, onRetry }: { shops: Shop[]; selected: string; error: string; loading: boolean; loadError: string; onSelect: (id: string) => void; onRetry: () => void }) {
  return <div className="step-content">
    <div className="order-step-kicker"><span className="order-kicker-dot" /> STEP 2 OF 4</div>
    <h1>Where should we<br /><span>get it printed?</span></h1>
    <p className="step-description">Choose a convenient spot. These are sample locations for the PrintFlow demo.</p>
    {loading ? <div className="shop-feedback" role="status"><span className="loading-spinner" /> Loading available print shops…</div> : loadError ? <div className="shop-feedback shop-feedback-error" role="alert"><span>{loadError}</span><button type="button" onClick={onRetry}>Try again</button></div> : shops.length === 0 ? <div className="shop-feedback">No print shops are available yet. Please try again later.</div> : <div className="shop-list" role="radiogroup" aria-label="Choose a print shop">{shops.map((shop) => <button type="button" role="radio" aria-checked={selected === shop.id} className={`shop-option${selected === shop.id ? ' is-selected' : ''}`} key={shop.id} onClick={() => onSelect(shop.id)}><span className="shop-pin"><OrderIcon name="pin" size={19} /></span><span className="shop-details"><strong>{shop.name}<span className="demo-badge">DEMO</span></strong><span>{shop.location || 'Location details unavailable'}</span><small>Sample print shop · Accra</small></span><span className="radio-mark" /></button>)}</div>}
    {error && <p className="field-error" role="alert">{error}</p>}
    <p className="demo-disclaimer">Demo locations only. These are not real businesses or live shop listings.</p>
  </div>
}

function OptionTile<T extends string>({ label, value, selected, children, onSelect }: { label: string; value: T; selected: T; children: ReactNode; onSelect: (value: T) => void }) {
  return <button type="button" className={`option-tile${selected === value ? ' is-selected' : ''}`} aria-pressed={selected === value} onClick={() => onSelect(value)}><span>{children}</span><strong>{label}</strong><span className="option-radio" /></button>
}

function OptionsStep({ options, shop, onChange }: { options: OrderOptions; shop: Shop; onChange: (options: OrderOptions) => void }) {
  const update = <K extends keyof OrderOptions>(key: K, value: OrderOptions[K]) => onChange({ ...options, [key]: value })
  return <div className="step-content">
    <div className="order-step-kicker"><span className="order-kicker-dot" /> STEP 3 OF 4</div>
    <h1>Make it <span>your way.</span></h1>
    <p className="step-description">Choose how you’d like your document printed. You can review everything next.</p>
    <div className="option-group"><FieldLabel htmlFor="copies">Number of copies</FieldLabel><div className="copies-control"><button type="button" aria-label="Remove one copy" disabled={options.copies <= 1} onClick={() => update('copies', Math.max(1, options.copies - 1))}>−</button><input id="copies" type="number" min="1" max="99" value={options.copies} onChange={(event) => update('copies', Math.min(99, Math.max(1, Number(event.target.value) || 1)))} /><button type="button" aria-label="Add one copy" disabled={options.copies >= 99} onClick={() => update('copies', Math.min(99, options.copies + 1))}>+</button></div></div>
    <div className="option-group"><FieldLabel>Ink</FieldLabel><div className="option-grid option-grid-two"><OptionTile label="Black & white" value="bw" selected={options.colour} onSelect={(value) => update('colour', value)}><span className="ink-swatch bw">Aa</span></OptionTile><OptionTile label="Colour" value="colour" selected={options.colour} onSelect={(value) => update('colour', value)}><span className="ink-swatch colour">Aa</span></OptionTile></div></div>
    <div className="option-group"><FieldLabel>Print sides</FieldLabel><div className="option-grid option-grid-two"><OptionTile label="Single-sided" value="single" selected={options.sides} onSelect={(value) => update('sides', value)}><span className="page-swatch">▤</span></OptionTile><OptionTile label="Double-sided" value="double" selected={options.sides} onSelect={(value) => update('sides', value)}><span className="page-swatch double-page">▤</span></OptionTile></div></div>
    <div className="option-group"><FieldLabel>Paper size</FieldLabel><div className="option-grid option-grid-two"><OptionTile label="A4 · Standard" value="A4" selected={options.paper} onSelect={(value) => update('paper', value)}><span className="paper-swatch">A4</span></OptionTile><OptionTile label="A3 · Large" value="A3" selected={options.paper} onSelect={(value) => update('paper', value)}><span className="paper-swatch paper-a3">A3</span></OptionTile></div></div>
    <div className="options-estimate"><span><b>Estimated price</b><small>Demo estimate · based on your selections</small></span><Price amount={estimatePrice(options, shop)} /></div>
  </div>
}

function estimatePrice(options: OrderOptions, shop: Shop) {
  const basePerCopy = Number(shop.price_per_page ?? 1.5) * (options.colour === 'colour' ? 4 / 1.5 : 1)
  const sizeMultiplier = options.paper === 'A3' ? 2.5 : 1
  const sidesMultiplier = options.sides === 'double' ? 1.25 : 1
  return basePerCopy * sizeMultiplier * sidesMultiplier * options.copies
}

function Price({ amount }: { amount: number }) {
  return <span className="price">GH₵ {amount.toFixed(2)}</span>
}

function OrderSummary({ file, shop, options, compact = false }: { file: File; shop: Shop; options: OrderOptions; compact?: boolean }) {
  return <aside className={`order-summary${compact ? ' summary-compact' : ''}`}><div className="summary-heading"><span>YOUR ORDER</span><span className="summary-status">DEMO ESTIMATE</span></div><div className="summary-file"><span className="summary-file-icon"><OrderIcon name="file" size={18} /></span><span><strong>{file.name}</strong><small>Print document</small></span></div><div className="summary-shop"><OrderIcon name="pin" size={17} /><span><strong>{shop.name}</strong><small>{shop.location || 'Location details unavailable'}</small></span></div><dl className="summary-options"><div><dt>Copies</dt><dd>{options.copies}</dd></div><div><dt>Ink</dt><dd>{options.colour === 'bw' ? 'Black & white' : 'Colour'}</dd></div><div><dt>Sides</dt><dd>{options.sides === 'single' ? 'Single-sided' : 'Double-sided'}</dd></div><div><dt>Paper</dt><dd>{options.paper}</dd></div></dl><div className="summary-total"><span>Estimated total</span><Price amount={estimatePrice(options, shop)} /></div><p className="estimate-note">Demo estimate only. Final shop pricing may vary.</p></aside>
}

function ReviewStep({ file, shop, options }: { file: File; shop: Shop; options: OrderOptions }) {
  return <div className="step-content review-content">
    <div className="order-step-kicker"><span className="order-kicker-dot" /> STEP 4 OF 4</div>
    <h1>One last look,<br /><span>then you’re set.</span></h1>
    <p className="step-description">Check your selections before placing this demo order.</p>
    <div className="review-card"><div className="review-card-heading"><OrderIcon name="file" size={19} /><strong>Order details</strong></div><div className="review-line"><span>Document</span><strong>{file.name}</strong></div><div className="review-line"><span>Print shop</span><strong>{shop.name}</strong></div><div className="review-line"><span>Location</span><strong>{shop.location || 'Location details unavailable'}</strong></div><div className="review-line"><span>Copies</span><strong>{options.copies}</strong></div><div className="review-line"><span>Ink</span><strong>{options.colour === 'bw' ? 'Black & white' : 'Colour'}</strong></div><div className="review-line"><span>Print sides</span><strong>{options.sides === 'single' ? 'Single-sided' : 'Double-sided'}</strong></div><div className="review-line"><span>Paper size</span><strong>{options.paper}</strong></div><div className="review-total"><span>Estimated price</span><Price amount={estimatePrice(options, shop)} /></div></div>
    <p className="review-estimate-note">This is a demo estimate. No payment will be collected.</p>
  </div>
}

function Confirmation({ order, shop, onNewOrder }: { order: SavedOrder; shop: Shop; onNewOrder: () => void }) {
  return <main className="confirmation-page"><div className="confirmation-card"><div className="confirmation-check"><OrderIcon name="check" size={30} /></div><div className="order-step-kicker"><span className="order-kicker-dot" /> ORDER CONFIRMED</div><h1>Your print order<br /><span>has been received.</span></h1><p className="confirmation-lede">You’re all set. Your order is in the queue for this demo shop.</p><div className="confirmation-meta"><div><span>ORDER NUMBER</span><strong>{order.number}</strong></div><div className="received-status"><span>ESTIMATED STATUS</span><strong><i /> {order.status}</strong></div></div><div className="pickup-code-panel"><span className="pickup-label">YOUR PICKUP CODE</span><strong>{order.code}</strong><span className="pickup-shop"><OrderIcon name="pin" size={16} /> {shop.name} · {shop.location || 'Location details unavailable'}</span></div><p className="pickup-message">Show this pickup code at the shop when collecting your order. Keep it handy for a quick pickup.</p><p className="demo-order-note">This is a demo confirmation. No payment was taken.</p><button className="button button-dark confirmation-new" type="button" onClick={onNewOrder}>Start another order <OrderIcon name="arrow" size={17} /></button></div></main>
}

function OrderFlow() {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [shopId, setShopId] = useState('')
  const [shops, setShops] = useState<Shop[]>([])
  const [shopsLoading, setShopsLoading] = useState(true)
  const [shopsLoadError, setShopsLoadError] = useState('')
  const [options, setOptions] = useState<OrderOptions>({ copies: 1, colour: 'bw', sides: 'single', paper: 'A4' })
  const [error, setError] = useState('')
  const [order, setOrder] = useState<SavedOrder | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissionPhase, setSubmissionPhase] = useState<'uploading' | 'saving' | null>(null)
  const [submitError, setSubmitError] = useState('')
  const selectedShop = shops.find((shop) => shop.id === shopId)

  const loadShops = async () => {
    setShopsLoading(true)
    setShopsLoadError('')
    try {
      const { data, error: queryError } = await getSupabaseClient()
        .from('shops')
        .select('id, name, location, price_per_page')
        .order('name')
      if (queryError) throw queryError
      setShops((data ?? []) as Shop[])
    } catch {
      setShopsLoadError('We couldn’t load print shops. Check your connection and try again.')
    } finally {
      setShopsLoading(false)
    }
  }

  useEffect(() => { void loadShops() }, [])

  const continueOrder = () => {
    if (step === 0 && !file) { setError('Choose a document to continue.'); return }
    if (step === 1 && (!shopId || !selectedShop)) { setError('Choose a print shop to continue.'); return }
    setError('')
    setStep((current) => Math.min(current + 1, 3))
  }
  const goBack = () => { setError(''); setStep((current) => Math.max(current - 1, 0)) }
  const placeOrder = async () => {
    if (!file || !selectedShop) {
      setSubmitError('Your document or print shop selection is missing. Go back and check your order.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    const orderId = crypto.randomUUID()
    const orderNumber = `PF-${orderId.replaceAll('-', '').slice(0, 20).toUpperCase()}`
    const pickupCode = `PF-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`
    const estimatedPrice = Number(estimatePrice(options, selectedShop).toFixed(2))
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_') || 'document'
    const filePath = `orders/${orderId}/${safeFileName}`
    let fileUploaded = false

    try {
      setSubmissionPhase('uploading')
      const { error: uploadError } = await getSupabaseClient()
        .storage
        .from('print-files')
        .upload(filePath, file, { upsert: false, contentType: contentTypeFor(file) })
      if (uploadError) throw new Error('upload')
      fileUploaded = true

      setSubmissionPhase('saving')
      const { error: insertError } = await getSupabaseClient().from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        pickup_code: pickupCode,
        shop_id: selectedShop.id,
        file_name: file.name,
        file_path: filePath,
        copies: options.copies,
        color_mode: options.colour,
        print_side: options.sides,
        paper_size: options.paper,
        estimated_price: estimatedPrice,
        status: 'Received',
      })
      if (insertError) throw new Error('order')
      setOrder({ number: orderNumber, code: pickupCode, status: 'Received' })
    } catch {
      setSubmitError(fileUploaded
        ? 'Your file uploaded privately, but the order could not be saved. Please try again; an unused private file may remain.'
        : 'We couldn’t upload your file, so no order was placed. Please try again.')
    } finally {
      setSubmitting(false)
      setSubmissionPhase(null)
    }
  }
  const startAnother = () => { setStep(0); setFile(null); setShopId(''); setOptions({ copies: 1, colour: 'bw', sides: 'single', paper: 'A4' }); setOrder(null); setError(''); setSubmitError('') }

  return <div className="order-app"><OrderHeader />{order && selectedShop ? <Confirmation order={order} shop={selectedShop} onNewOrder={startAnother} /> : <main className="order-page"><div className="container order-layout"><div className="order-main"><a className="back-link" href="/"><span aria-hidden="true">←</span> Back to PrintFlow</a><Progress current={step} /><div className="step-panel">
      {step === 0 && <UploadStep file={file} error={error} onFile={(nextFile) => { setFile(nextFile); setError(nextFile ? '' : 'Choose a PDF, Word document, or image file.') }} />}
      {step === 1 && <ShopStep shops={shops} selected={shopId} error={error} loading={shopsLoading} loadError={shopsLoadError} onSelect={(id) => { setShopId(id); setError('') }} onRetry={() => void loadShops()} />}
      {step === 2 && selectedShop && <OptionsStep options={options} shop={selectedShop} onChange={setOptions} />}
      {step === 3 && file && selectedShop && <ReviewStep file={file} shop={selectedShop} options={options} />}
    </div>{submitError && <p className="submit-error" role="alert">{submitError}</p>}<div className="step-actions">{step > 0 && <button type="button" className="back-button" onClick={goBack} disabled={submitting}>← <span>Back</span></button>}{step < 3 ? <button type="button" className="button button-dark continue-button" onClick={continueOrder} disabled={step === 1 && (shopsLoading || Boolean(shopsLoadError) || shops.length === 0)}>Continue <OrderIcon name="arrow" size={17} /></button> : <button type="button" className="button button-primary continue-button" onClick={() => void placeOrder()} disabled={submitting}>{submitting ? <><span className="loading-spinner loading-spinner-button" /> {submissionPhase === 'uploading' ? 'Uploading file…' : 'Saving order…'}</> : <>Place Print Order <OrderIcon name="arrow" size={17} /></>}</button>}</div><p className="order-step-footnote">{step < 3 ? 'You can review your order before placing it.' : submitting ? submissionPhase === 'uploading' ? 'Uploading your document to private storage…' : 'Saving order details…' : 'No payment will be taken'}</p></div><div className="order-sidebar">{file && selectedShop ? <OrderSummary file={file} shop={selectedShop} options={options} /> : <div className="sidebar-intro"><span className="sidebar-icon"><OrderIcon name="upload" size={21} /></span><strong>{file ? 'Choose a print shop' : 'Start with your document'}</strong><p>{file ? 'Select a shop to see its estimated print price.' : 'Your order details will appear here as you go.'}</p><div className="sidebar-perks"><span><OrderIcon name="check" size={14} /> Uploads use private storage</span><span><OrderIcon name="check" size={14} /> No payment in this demo</span></div></div>}<div className="sidebar-help"><span>NEED A HAND?</span><p>Follow the steps and we’ll guide you through your print order.</p></div></div></div></main>}<footer className="order-footer"><div className="container"><span>© {new Date().getFullYear()} PrintFlow</span><span>PrintFlow order demo</span></div></footer></div>
}

export default OrderFlow
