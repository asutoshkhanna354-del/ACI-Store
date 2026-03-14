import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, clearCart, totalPrice } = useCart();
  const { formatPrice, t } = useCurrency();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const navigate = useNavigate();

  const applyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    try {
      const data = await apiFetch('/store/apply-promo', {
        method: 'POST',
        body: JSON.stringify({ code: promoCode, amount: totalPrice })
      });
      setDiscount(data.discount);
      setAppliedPromo(data.promo_code);
      toast.success(`${t('promoApplied')} ${formatPrice(data.discount)} ${t('off')}`);
    } catch (err) {
      toast.error(err.message);
      setDiscount(0);
      setAppliedPromo('');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setDiscount(0);
    setAppliedPromo('');
    setPromoCode('');
  };

  const durationLabels = { '1day': t('day1'), '7day': t('days7'), '30day': t('days30'), '60day': t('days60') };

  if (cart.length === 0) {
    return (
      <div className="container fade-in" style={{ padding: '60px 20px' }}>
        <div className="empty-state">
          <h3>{t('cartEmpty')}</h3>
          <p>{t('cartEmptyDesc')}</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/store')}>{t('browseStore')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ maxWidth: '700px', padding: '40px 20px' }}>
      <h1 className="page-title">{t('shoppingCart')}</h1>
      <p className="page-subtitle">{cart.length} {t('itemsInCart')}</p>

      {cart.map(item => (
        <div key={item.id} className="card" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{item.panel_name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.section_name} • {durationLabels[item.duration]}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent)' }}>{formatPrice(item.price)}</span>
            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>{t('remove')}</button>
          </div>
        </div>
      ))}

      <div className="card mt-3">
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>{t('promoCode')}</h3>
        {appliedPromo ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-success">{appliedPromo} - {formatPrice(discount)} {t('off')}</span>
            <button className="btn btn-sm btn-danger" onClick={removePromo}>{t('remove')}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder={t('promoCode')} style={{
                flex: 1, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px'
              }} />
            <button className="btn btn-primary" onClick={applyPromo} disabled={promoLoading}>
              {promoLoading ? '...' : t('apply')}
            </button>
          </div>
        )}
      </div>

      <div className="order-summary mt-3">
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>{t('orderSummary')}</h3>
        <div className="order-summary-row">
          <span>{t('subtotal')}</span><span>{formatPrice(totalPrice)}</span>
        </div>
        {discount > 0 && (
          <div className="order-summary-row">
            <span className="text-success">{t('discount')}</span><span className="text-success">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="order-summary-row">
          <span>{t('total')}</span><span>{formatPrice(totalPrice - discount)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-outline" onClick={clearCart}>{t('clearCart')}</button>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => navigate('/checkout', { state: { promoCode: appliedPromo, discount } })}>
          {t('proceedToCheckout')} →
        </button>
      </div>
    </div>
  );
}
