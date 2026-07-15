import Icon from './Icon'
import { formatINR } from '../data/mock'
import type { Sale, StoreProfile } from '../lib/types'
import './receipt.css'

type Props = {
  sale: Sale
  store: StoreProfile | null
  onClose: () => void
}

function fmtDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function SaleReceipt({ sale, store, onClose }: Props) {
  const subtotal = sale.subtotal ?? sale.totalValue
  const discount = sale.discountAmount ?? 0
  const billNo = sale.id.slice(-6).toUpperCase()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="receipt-shell" onClick={(e) => e.stopPropagation()}>
        <div className="receipt" id="receipt-print">
          <div className="rcpt-head">
            <div className="rcpt-logo">
              <Icon name="store" size={22} strokeWidth={2.2} />
            </div>
            <h2>{store?.storeName ?? 'My Store'}</h2>
            {store?.address && <p className="rcpt-addr">{store.address}</p>}
            {store?.phone && <p className="rcpt-addr">☎ {store.phone}</p>}
          </div>

          <div className="rcpt-meta">
            <div>
              <span>Bill No.</span>
              <strong>#{billNo}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{fmtDateTime(sale.date)}</strong>
            </div>
            {sale.customer && (
              <div>
                <span>Customer</span>
                <strong>{sale.customer}</strong>
              </div>
            )}
          </div>

          <table className="rcpt-table">
            <thead>
              <tr>
                <th className="l">Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th className="r">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it, i) => (
                <tr key={i}>
                  <td className="l">
                    {it.emoji} {it.name}
                  </td>
                  <td>{it.qty}</td>
                  <td>{formatINR(it.price)}</td>
                  <td className="r">{formatINR(it.qty * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="rcpt-totals">
            <div className="rcpt-row">
              <span>Subtotal ({sale.totalUnits} units)</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="rcpt-row disc">
                <span>
                  Discount
                  {sale.discountType === 'percent'
                    ? ` (${sale.discountValue}%)`
                    : ''}
                </span>
                <span>−{formatINR(discount)}</span>
              </div>
            )}
            <div className="rcpt-row grand">
              <span>Total</span>
              <span>{formatINR(sale.totalValue)}</span>
            </div>
          </div>

          <div className="rcpt-foot">
            <p>Thank you for shopping! 🙏</p>
            <p className="rcpt-powered">Billed with DistributeIQ</p>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Icon name="reports" size={16} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  )
}
