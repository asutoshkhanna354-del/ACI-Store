import { useState, useEffect, useMemo, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch, getToken } from '../api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, clearCart, totalPrice } = useCart();
  const { formatPrice, currency, rates, t } = useCurrency();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const promoCode = location.state?.promoCode || '';
  const discount = location.state?.discount || 0;
  const finalPrice = totalPrice - discount;

  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [qrData, setQrData] = useState('');
  const [orders, setOrders] = useState([]);
  const [utrNumber, setUtrNumber] = useState('');
  const [txHash, setTxHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofUploading, setProofUploading] = useState(false);
  const proofInputRef = useRef(null);

  useEffect(() => {
    if (cart.length === 0 && step === 1) { navigate('/cart'); return; }
    apiFetch('/store/settings').then(s => {
      setSettings(s);
      if (s.payment_method_upi === 'true' && s.payment_method_crypto !== 'true') {
        setPaymentMethod('upi');
      } else if (s.payment_method_crypto === 'true' && s.payment_method_upi !== 'true') {
        setPaymentMethod('crypto');
      }
    }).catch(() => {});
  }, []);

  const inrAmount = useMemo(() => {
    const inrRate = rates['INR'] || 83.5;
    return Math.round(finalPrice * inrRate);
  }, [finalPrice, rates]);

  const usdAmount = useMemo(() => {
    return parseFloat(finalPrice).toFixed(2);
  }, [finalPrice]);

  useEffect(() => {
    if (paymentMethod === 'upi' && settings.upi_id && inrAmount > 0) {
      apiFetch(`/store/qr/${encodeURIComponent(settings.upi_id)}/${inrAmount}`).then(d => setQrData(d.qr)).catch(() => {});
    }
  }, [paymentMethod, settings.upi_id, inrAmount]);

  const usdtNetworks = [];
  if (settings.crypto_usdt_trc20_address) usdtNetworks.push({ key: 'trc20', label: 'TRC20 (Tron)', address: settings.crypto_usdt_trc20_address });
  if (settings.crypto_usdt_erc20_address) usdtNetworks.push({ key: 'erc20', label: 'ERC20 (Ethereum)', address: settings.crypto_usdt_erc20_address });
  if (settings.crypto_usdt_bep20_address) usdtNetworks.push({ key: 'bep20', label: 'BEP20 (BSC)', address: settings.crypto_usdt_bep20_address });

  const getCryptoAddress = () => {
    if (selectedCrypto === 'btc') return settings.crypto_btc_address;
    if (selectedCrypto === 'usdt') {
      const net = usdtNetworks.find(n => n.key === selectedNetwork);
      return net?.address || '';
    }
    return '';
  };

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr).then(() => toast.success('Address copied!')).catch(() => {});
  };

  const placeOrders = async () => {
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }
    if (paymentMethod === 'crypto' && !selectedCrypto) { toast.error('Please select a cryptocurrency'); return; }
    if (paymentMethod === 'crypto' && selectedCrypto === 'usdt' && !selectedNetwork) { toast.error('Please select a USDT network'); return; }
    setSubmitting(true);
    try {
      const pm = paymentMethod === 'crypto' ? `crypto_${selectedCrypto}${selectedCrypto === 'usdt' ? `_${selectedNetwork}` : ''}` : paymentMethod;
      const createdOrders = [];
      for (const item of cart) {
        const order = await apiFetch('/store/order', {
          method: 'POST',
          body: JSON.stringify({ 
            panel_id: item.panel_id, 
            duration: item.duration, 
            promo_code: promoCode, 
            payment_method: pm,
            customer_email: user.email 
          })
        });
        createdOrders.push(order);
      }
      setOrders(createdOrders);
      clearCart();
      setStep(2);
      toast.success(t('orderCreated'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitProof = async () => {
    let ref = '';
    if (paymentMethod === 'upi') ref = utrNumber;
    else if (paymentMethod === 'crypto') ref = txHash;
    else ref = utrNumber; // For PayPal and BD Pay

    if (!ref.trim()) { 
      toast.error(
        paymentMethod === 'upi' ? 'Enter UTR number' : 
        paymentMethod === 'crypto' ? 'Enter transaction hash' : 
        'Enter transaction ID'
      ); 
      return; 
    }
    setSubmitting(true);
    try {
      for (const order of orders) {
        await apiFetch(`/store/order/${order.id}/utr`, {
          method: 'PUT',
          body: JSON.stringify({ utr_number: ref })
        });
      }
      setStep(3);
      toast.success('Payment proof submitted!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProofImage = async () => {
    if (!proofFile || orders.length === 0) return true;
    setProofUploading(true);
    try {
      for (const order of orders) {
        const formData = new FormData();
        formData.append('proof', proofFile);
        const token = getToken();
        const res = await fetch(`/api/store/order/${order.id}/proof`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
      }
      toast.success('Payment screenshot uploaded');
      return true;
    } catch (err) {
      toast.error('Screenshot upload failed: ' + err.message);
      return false;
    } finally {
      setProofUploading(false);
    }
  };

  const getDurationLabel = (dur) => {
    const fixed = { '1day': t('day1'), '7day': t('days7'), '30day': t('days30'), '60day': t('days60') };
    if (fixed[dur]) return fixed[dur];
    const dayMatch = dur.match(/^(\d+)day$/);
    if (dayMatch) {
      const d = parseInt(dayMatch[1]);
      return `${d} ${d === 1 ? 'Day' : 'Days'}`;
    }
    return dur;
  };
  const durationLabels = new Proxy({}, { get: (_, key) => getDurationLabel(key) });
  const upiEnabled = settings.payment_method_upi === 'true';
  const cryptoEnabled = settings.payment_method_crypto === 'true';
  const paypalEnabled = settings.payment_method_paypal === 'true';
  const bdEnabled = settings.payment_method_bd === 'true';
  const binanceEnabled = settings.payment_method_binance === 'true';

  if (step === 3) {
    return (
      <div className="container fade-in" style={{ maxWidth: '600px', padding: '60px 20px', textAlign: 'center' }}>
        <div className="card">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{t('paymentVerificationPending')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {paymentMethod === 'upi' ? t('utrNumber') : t('transactionHash')} <strong className="text-accent">{paymentMethod === 'upi' ? utrNumber : txHash}</strong> {t('utrSubmitted')}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
            {t('checkStatusInMyOrders')}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/my-orders')}>{t('viewMyOrders')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ maxWidth: '600px', padding: '40px 20px' }}>
      <h1 className="page-title">{t('checkout')}</h1>
      <p className="page-subtitle">{t('completeYourPurchase')}</p>

      {step === 1 && (
        <>
          <div className="order-summary mb-3">
            <h3 style={{ marginBottom: '16px' }}>{t('orderSummary')}</h3>
            {cart.map(item => (
              <div key={item.id} className="order-summary-row">
                <span>{item.panel_name} ({durationLabels[item.duration]})</span>
                <span>{formatPrice(item.price)}</span>
              </div>
            ))}
            {discount > 0 && (
              <div className="order-summary-row">
                <span className="text-success">{t('discount')} ({promoCode})</span>
                <span className="text-success">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="order-summary-row">
              <span>{t('total')}</span><span>{formatPrice(finalPrice)}</span>
            </div>
          </div>

          {(upiEnabled || cryptoEnabled || paypalEnabled || bdEnabled || binanceEnabled) && (
            <div className="card mb-3">
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>{t('selectPaymentMethod')}</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {upiEnabled && (
                  <button className={`payment-method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('upi'); setSelectedCrypto(''); setSelectedNetwork(''); }}>
                    <span style={{ fontSize: '24px' }}>🇮🇳</span>
                    <span>UPI</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('indian')}</span>
                  </button>
                )}
                {cryptoEnabled && (
                  <button className={`payment-method-btn ${paymentMethod === 'crypto' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('crypto'); setQrData(''); }}>
                    <span style={{ fontSize: '24px' }}>🌐</span>
                    <span>Crypto</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('international')}</span>
                  </button>
                )}
                {paypalEnabled && (
                  <button className={`payment-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('paypal'); setQrData(''); setSelectedCrypto(''); setSelectedNetwork(''); }}>
                    <span style={{ fontSize: '24px' }}>💳</span>
                    <span>PayPal</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('international')}</span>
                  </button>
                )}
                {bdEnabled && (
                  <button className={`payment-method-btn ${paymentMethod === 'bd' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('bd'); setQrData(''); setSelectedCrypto(''); setSelectedNetwork(''); }}>
                    <span style={{ fontSize: '24px' }}>🇧🇩</span>
                    <span>BD Pay</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>bKash/Nagad</span>
                  </button>
                )}
                {binanceEnabled && (
                  <button className={`payment-method-btn ${paymentMethod === 'binance' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('binance'); setQrData(''); setSelectedCrypto(''); setSelectedNetwork(''); }}>
                    <span style={{ fontSize: '24px' }}>🟡</span>
                    <span>Binance</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Binance Pay</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="qr-section mb-3">
              <h3 style={{ marginBottom: '8px' }}>{t('scanQrToPay')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('payExactly')} <strong>₹{inrAmount.toLocaleString()}</strong> {t('viaUPI')}</p>
              {qrData && <img src={qrData} alt="UPI QR Code" style={{ width: '250px', height: '250px' }} />}
              <div className="upi-id-display">{settings.upi_id}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
                UPI ID: {settings.upi_id}
              </p>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="card mb-3 text-center" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Pay with PayPal</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Send <strong style={{ color: 'var(--accent)' }}>${usdAmount} USD</strong> to:
              </p>
              <div className="upi-id-display" style={{ marginBottom: '16px' }}>{settings.paypal_id}</div>
              <div style={{ background: 'white', padding: '12px', display: 'inline-block', borderRadius: '12px', marginBottom: '16px' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://www.paypal.com/paypalme/' + settings.paypal_id.split('@')[0])}`} alt="PayPal QR" style={{ width: '200px', height: '200px' }} />
              </div>
              <button className="btn btn-sm btn-outline" style={{ width: '100%' }} onClick={() => copyAddress(settings.paypal_id)}>Copy PayPal ID</button>
            </div>
          )}

          {paymentMethod === 'bd' && (
            <div className="card mb-3" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Bangladesh (bKash / Nagad)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
                Send payment to one of these numbers:
              </p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {settings.bkash_number && (
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>bKash Personal</p>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#d12053' }}>{settings.bkash_number}</p>
                    </div>
                    <button className="btn btn-xs btn-outline" onClick={() => copyAddress(settings.bkash_number)}>Copy</button>
                  </div>
                )}
                {settings.nagad_number && (
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Nagad Personal</p>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#f7941d' }}>{settings.nagad_number}</p>
                    </div>
                    <button className="btn btn-xs btn-outline" onClick={() => copyAddress(settings.nagad_number)}>Copy</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {paymentMethod === 'binance' && (
            <div className="card mb-3" style={{ padding: '24px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '12px' }}>Pay with Binance</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Send <strong style={{ color: 'var(--accent)' }}>${usdAmount} USD</strong> to the Binance UID below
              </p>
              <div style={{
                background: 'var(--bg-input)', border: '2px solid #f0b90b', borderRadius: '12px',
                padding: '16px', marginBottom: '16px'
              }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Binance UID</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#f0b90b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {settings.binance_uid}
                </p>
              </div>
              <button className="btn btn-sm btn-outline" style={{ width: '100%' }} onClick={() => copyAddress(settings.binance_uid)}>
                Copy Binance UID
              </button>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '12px' }}>
                You can pay via Binance Pay or P2P transfer to this UID
              </p>
            </div>
          )}

          {paymentMethod === 'crypto' && (
            <div className="card mb-3">
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>{t('selectCrypto')}</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {settings.crypto_btc_address && (
                  <button className={`payment-method-btn ${selectedCrypto === 'btc' ? 'active' : ''}`}
                    onClick={() => { setSelectedCrypto('btc'); setSelectedNetwork(''); }}>
                    <span style={{ fontSize: '20px', color: '#f7931a' }}>₿</span>
                    <span>Bitcoin</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>BTC</span>
                  </button>
                )}
                {usdtNetworks.length > 0 && (
                  <button className={`payment-method-btn ${selectedCrypto === 'usdt' ? 'active' : ''}`}
                    onClick={() => setSelectedCrypto('usdt')}>
                    <span style={{ fontSize: '20px', color: '#26a17b' }}>₮</span>
                    <span>Tether</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>USDT</span>
                  </button>
                )}
              </div>

              {selectedCrypto === 'usdt' && usdtNetworks.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{t('selectUsdtNetwork')}:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {usdtNetworks.map(n => (
                      <button key={n.key}
                        className={`btn btn-sm ${selectedNetwork === n.key ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSelectedNetwork(n.key)}>
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {getCryptoAddress() && (
                <div style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {t('sendWorth')} <strong style={{ color: 'var(--accent)' }}>${usdAmount} USD</strong> {t('sendWorth')} {selectedCrypto.toUpperCase()} {t('to')}:
                  </p>
                  <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: '10px',
                    padding: '12px', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all',
                    color: 'var(--accent)', marginBottom: '10px'
                  }}>
                    {getCryptoAddress()}
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => copyAddress(getCryptoAddress())}>
                    {t('copyAddress')}
                  </button>
                  <p style={{ color: 'var(--warning)', fontSize: '11px', marginTop: '10px' }}>
                    ⚠️ {t('cryptoWarning')}
                  </p>
                </div>
              )}
            </div>
          )}

          {paymentMethod && (
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              onClick={placeOrders} disabled={submitting || (paymentMethod === 'crypto' && !getCryptoAddress())}>
              {submitting ? t('placingOrder') : t('ivePaidPlaceOrder')}
            </button>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <div className="card mb-3" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3>{t('orderCreated')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              {t('submitProof')} {paymentMethod === 'upi' ? t('utrNumber') : t('transactionHash')} {t('toVerifyPayment')}
            </p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>
              {paymentMethod === 'upi' ? t('utrNumber') : paymentMethod === 'crypto' ? t('transactionHash') : 'Transaction ID'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              {paymentMethod === 'upi' ? t('enterUtr') : paymentMethod === 'crypto' ? t('enterTxHash') : 'Enter the transaction ID or number from your payment app'}
            </p>
            <div className="input-group">
              <label>{paymentMethod === 'upi' ? t('utrNumber') : paymentMethod === 'crypto' ? t('transactionHash') : 'Transaction ID'}</label>
              {paymentMethod === 'crypto' ? (
                <input type="text" value={txHash} onChange={e => setTxHash(e.target.value)}
                  placeholder={t('enterTxHashPlaceholder')} style={{ fontFamily: 'monospace', fontSize: '13px' }} />
              ) : (
                <input type="text" value={utrNumber} onChange={e => setUtrNumber(e.target.value)}
                  placeholder={paymentMethod === 'upi' ? t('enter12DigitUtr') : "Enter transaction ID"} />
              )}
            </div>
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Payment Screenshot (optional)
              </label>
              <div
                onClick={() => proofInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: '10px', padding: '16px',
                  textAlign: 'center', cursor: 'pointer', background: 'var(--bg-input)', marginBottom: '12px'
                }}
              >
                {proofFile ? (
                  <p style={{ color: 'var(--success)', fontSize: '13px' }}>📎 {proofFile.name}</p>
                ) : (
                  <>
                    <p style={{ fontSize: '20px', marginBottom: '4px' }}>📸</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Click to upload payment screenshot</p>
                  </>
                )}
              </div>
              <input ref={proofInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => setProofFile(e.target.files?.[0] || null)} />
            </div>

            <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}
              onClick={async () => {
                if (proofFile) {
                  const ok = await uploadProofImage();
                  if (!ok) return;
                }
                await submitProof();
              }} disabled={submitting || proofUploading}>
              {submitting || proofUploading ? t('submitting') : t('submitForVerification')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
