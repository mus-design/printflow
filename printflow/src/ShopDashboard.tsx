import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from './lib/supabase'
import './ShopDashboard.css'

type OrderStatus = 'Received' | 'Printing' | 'Ready' | 'Collected'
type ShopRelation = { name: string } | { name: string }[] | null
type ShopOrder = {
  id: string
  order_number: string
  file_name: string
  copies: number | null
  color_mode: string | null
  print_side: string | null
  paper_size: string | null
  estimated_price: number | string | null
  status: OrderStatus
  created_at: string
  shop: ShopRelation
}

const statuses: OrderStatus[] = ['Received', 'Printing', 'Ready', 'Collected']
const filters = ['All orders', ...statuses] as const
type StatusFilter = typeof filters[number]

function DashboardIcon({ name, size = 20 }: { name: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const }
  if (name === 'search') return <svg {...props}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
  if (name === 'file') return <svg {...props}><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" /><path d="M13 3v7h7M8 14h8M8 17h5" /></svg>
  if (name === 'refresh') return <svg {...props}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" /></svg>
  if (name === 'pin') return <svg {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
  if (name === 'clock') return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  if (name === 'check') return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></svg>
  return <svg {...props}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
}

function DashboardHeader() {
  return <header className="dashboard-header"><div className="dashboard-shell dashboard-header-inner"><a className="brand" href="/" aria-label="PrintFlow home"><span className="brand-mark"><span /></span><span>PrintFlow</span></a><div className="dashboard-header-right"><span className="operator-label"><i /> SHOP WORKSPACE</span><a href="/" className="dashboard-home-link">Customer site ↗</a></div></div></header>
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><i />{status}</span>
}

function StatusControl({ order, updating, onChange }: { order: ShopOrder; updating: boolean; onChange: (status: OrderStatus) => void }) {
  return <label className="status-control-label"><span className="visually-hidden">Update status for {order.order_number}</span><select className="status-select" value={order.status} disabled={updating} onChange={(event) => onChange(event.target.value as OrderStatus)}>{statuses.map((status) => <option value={status} key={status}>{status}</option>)}</select>{updating && <span className="dashboard-spinner" aria-label="Saving status" />}</label>
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function relatedShopName(shop: ShopRelation) {
  if (Array.isArray(shop)) return shop[0]?.name ?? 'Unknown shop'
  return shop?.name ?? 'Unknown shop'
}

function OrderRow({ order, updating, error, onStatusChange }: { order: ShopOrder; updating: boolean; error?: string; onStatusChange: (status: OrderStatus) => void }) {
  return <>
    <tr>
      <td><span className="order-number">{order.order_number}</span><span className="order-date mobile-only">{formatDate(order.created_at)}</span></td>
      <td><span className="file-cell"><span className="file-cell-icon"><DashboardIcon name="file" size={16} /></span><span className="file-name" title={order.file_name}>{order.file_name}</span></span></td>
      <td><span className="table-shop"><DashboardIcon name="pin" size={15} />{relatedShopName(order.shop)}</span></td>
      <td><span className="order-copies">{order.copies ?? '—'} {order.copies === 1 ? 'copy' : 'copies'}</span><span className="order-specs">{order.color_mode === 'colour' ? 'Colour' : order.color_mode === 'bw' ? 'B&W' : '—'} · {order.paper_size ?? '—'} · {order.print_side === 'double' ? 'Double-sided' : order.print_side === 'single' ? 'Single-sided' : '—'}</span></td>
      <td><span className="order-price">{order.estimated_price == null ? '—' : `GH₵ ${Number(order.estimated_price).toFixed(2)}`}</span></td>
      <td><span className="desktop-status"><StatusBadge status={order.status} /></span><span className="order-date desktop-date">{formatDate(order.created_at)}</span></td>
      <td><StatusControl order={order} updating={updating} onChange={onStatusChange} /></td>
    </tr>
    {error && <tr className="row-error-row"><td colSpan={7}><p className="row-error" role="alert">{error}</p></td></tr>}
  </>
}

function MobileOrderCard({ order, updating, error, onStatusChange }: { order: ShopOrder; updating: boolean; error?: string; onStatusChange: (status: OrderStatus) => void }) {
  return <article className="mobile-order-card"><div className="mobile-order-head"><span className="order-number">{order.order_number}</span><StatusBadge status={order.status} /></div><div className="mobile-order-file"><span className="file-cell-icon"><DashboardIcon name="file" size={16} /></span><strong>{order.file_name}</strong></div><div className="mobile-shop-line"><DashboardIcon name="pin" size={15} /> {relatedShopName(order.shop)}</div><div className="mobile-order-facts"><span>{order.copies ?? '—'} {order.copies === 1 ? 'copy' : 'copies'}</span><span>{order.color_mode === 'colour' ? 'Colour' : order.color_mode === 'bw' ? 'Black & white' : 'Ink unspecified'}</span><span>{order.paper_size ?? 'Paper unspecified'}</span><span>{order.print_side === 'double' ? 'Double-sided' : order.print_side === 'single' ? 'Single-sided' : 'Sides unspecified'}</span></div><div className="mobile-order-bottom"><div><strong>{order.estimated_price == null ? 'Price unavailable' : `GH₵ ${Number(order.estimated_price).toFixed(2)}`}</strong><span>{formatDate(order.created_at)}</span></div><StatusControl order={order} updating={updating} onChange={onStatusChange} /></div>{error && <p className="row-error" role="alert">{error}</p>}</article>
}

function ShopDashboard() {
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('All orders')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const { data, error } = await getSupabaseClient()
        .from('orders')
        .select('id, order_number, file_name, copies, color_mode, print_side, paper_size, estimated_price, status, created_at, shop:shops(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders((data ?? []) as unknown as ShopOrder[])
    } catch {
      setLoadError('We couldn’t load orders. Check your connection and database setup, then try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadOrders() }, [loadOrders])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus = filter === 'All orders' || order.status === filter
      const matchesSearch = !normalizedSearch || order.order_number.toLowerCase().includes(normalizedSearch) || order.file_name.toLowerCase().includes(normalizedSearch)
      return matchesStatus && matchesSearch
    })
  }, [filter, orders, search])

  const counts = useMemo(() => ({
    all: orders.length,
    received: orders.filter((order) => order.status === 'Received').length,
    printing: orders.filter((order) => order.status === 'Printing').length,
    ready: orders.filter((order) => order.status === 'Ready').length,
  }), [orders])

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId)
    setRowErrors((current) => ({ ...current, [orderId]: '' }))
    try {
      const { error } = await getSupabaseClient().from('orders').update({ status }).eq('id', orderId)
      if (error) throw error
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order))
    } catch {
      setRowErrors((current) => ({ ...current, [orderId]: 'Status could not be saved. Check your connection and try again.' }))
    } finally {
      setUpdatingId(null)
    }
  }

  return <div className="shop-dashboard"><DashboardHeader /><main className="dashboard-main"><div className="dashboard-shell"><div className="dashboard-title-row"><div><div className="dashboard-eyebrow"><span /> PRINTFLOW FOR BUSINESS</div><h1>Order dashboard</h1><p>Keep every print order moving, from received to collected.</p></div><button type="button" className="refresh-button" onClick={() => void loadOrders()} disabled={loading}><DashboardIcon name="refresh" size={16} /><span>{loading ? 'Refreshing…' : 'Refresh'}</span></button></div>
    <section className="dashboard-stats" aria-label="Order overview"><article className="stat-card"><span className="stat-label">ALL ORDERS</span><strong>{counts.all}</strong><span className="stat-icon stat-icon-all"><DashboardIcon name="list" size={19} /></span></article><article className="stat-card"><span className="stat-label">RECEIVED</span><strong>{counts.received}</strong><span className="stat-icon stat-icon-received"><DashboardIcon name="clock" size={19} /></span></article><article className="stat-card"><span className="stat-label">PRINTING</span><strong>{counts.printing}</strong><span className="stat-icon stat-icon-printing"><DashboardIcon name="file" size={19} /></span></article><article className="stat-card"><span className="stat-label">READY FOR PICKUP</span><strong>{counts.ready}</strong><span className="stat-icon stat-icon-ready"><DashboardIcon name="check" size={19} /></span></article></section>
    <section className="orders-panel"><div className="orders-panel-top"><div><h2>Incoming orders</h2><p>Review details and update each order’s progress.</p></div><span className="order-count-pill">{filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}</span></div><div className="orders-tools"><label className="search-box"><DashboardIcon name="search" size={17} /><span className="visually-hidden">Search by order number or file name</span><input type="search" placeholder="Search order or file name" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="filter-box"><span>STATUS</span><select value={filter} onChange={(event) => setFilter(event.target.value as StatusFilter)} aria-label="Filter orders by status">{filters.map((status) => <option value={status} key={status}>{status}</option>)}</select></label></div>
      {loading ? <div className="dashboard-state" role="status"><span className="dashboard-spinner dashboard-spinner-large" /><strong>Loading orders</strong><p>Getting the latest print orders…</p></div> : loadError ? <div className="dashboard-state dashboard-state-error" role="alert"><span className="state-mark">!</span><strong>Orders aren’t available right now</strong><p>{loadError}</p><button className="button button-dark" type="button" onClick={() => void loadOrders()}>Try again</button></div> : orders.length === 0 ? <div className="dashboard-state"><span className="state-mark"><DashboardIcon name="file" size={21} /></span><strong>No orders yet</strong><p>Customer orders will appear here when they’re submitted.</p></div> : filteredOrders.length === 0 ? <div className="dashboard-state"><span className="state-mark"><DashboardIcon name="search" size={21} /></span><strong>No matching orders</strong><p>Try a different search or status filter.</p><button type="button" className="clear-filters" onClick={() => { setFilter('All orders'); setSearch('') }}>Clear filters</button></div> : <><div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>ORDER</th><th>DOCUMENT</th><th>SHOP</th><th>PRINT DETAILS</th><th>ESTIMATE</th><th>STATUS & DATE</th><th>UPDATE STATUS</th></tr></thead><tbody>{filteredOrders.map((order) => <OrderRow key={order.id} order={order} updating={updatingId === order.id} error={rowErrors[order.id]} onStatusChange={(status) => void updateOrderStatus(order.id, status)} />)}</tbody></table></div><div className="mobile-order-list">{filteredOrders.map((order) => <MobileOrderCard key={order.id} order={order} updating={updatingId === order.id} error={rowErrors[order.id]} onStatusChange={(status) => void updateOrderStatus(order.id, status)} />)}</div></>}
    </section><p className="dashboard-footnote">PrintFlow Shop Dashboard · Status changes save to Supabase.</p></div></main><footer className="dashboard-footer"><div className="dashboard-shell"><span>© {new Date().getFullYear()} PrintFlow</span><span>Shop workspace</span></div></footer></div>
}

export default ShopDashboard
