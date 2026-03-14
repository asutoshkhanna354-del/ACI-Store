import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';

export default function AdminPaymentOptions() {
  const [settings, setSettings] = useState({
    payment_method_upi: 'true',
    payment_method_crypto: 'true',
    upi_id: '',
    crypto_btc_address: '',
    crypto_usdt_trc20_address: '',
    crypto_usdt_erc20_address: '',
    crypto_usdt_bep20_address: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch('/admin/settings').then(s => setSettings(prev => ({ ...prev, ...s }))).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      toast.success('Payment settings saved!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: prev[key] === 'true' ? 'false' : 'true' }));
  };

  return (
    <AdminLayout>
      <h1 className="page-title">Payment Options</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Configure payment methods for your store</p>

      <div style={{ maxWidth: '650px' }}>
        <div className="card" style={{ marginBottom: '20px', borderColor: settings.payment_method_upi === 'true' ? 'var(--accent)' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🇮🇳 UPI Payments
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>For Indian customers</p>
            </div>
            <button
              className={`btn btn-sm ${settings.payment_method_upi === 'true' ? 'btn-success' : 'btn-outline'}`}
              onClick={() => toggle('payment_method_upi')}>
              {settings.payment_method_upi === 'true' ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {settings.payment_method_upi === 'true' && (
            <div className="input-group">
              <label>UPI ID</label>
              <input type="text" value={settings.upi_id}
                onChange={e => setSettings({...settings, upi_id: e.target.value})}
                placeholder="yourupi@bank" />
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                QR code will be generated automatically for customers at checkout
              </p>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '20px', borderColor: settings.payment_method_crypto === 'true' ? 'var(--accent)' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🌐 Crypto Payments
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>For international customers</p>
            </div>
            <button
              className={`btn btn-sm ${settings.payment_method_crypto === 'true' ? 'btn-success' : 'btn-outline'}`}
              onClick={() => toggle('payment_method_crypto')}>
              {settings.payment_method_crypto === 'true' ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {settings.payment_method_crypto === 'true' && (
            <>
              <div style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#f7931a' }}>₿</span> Bitcoin (BTC)
                </h4>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>BTC Receiving Address</label>
                  <input type="text" value={settings.crypto_btc_address}
                    onChange={e => setSettings({...settings, crypto_btc_address: e.target.value})}
                    placeholder="Enter your BTC wallet address"
                    style={{ fontSize: '13px', fontFamily: 'monospace' }} />
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#26a17b' }}>₮</span> Tether (USDT)
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px' }}>
                  Add receiving addresses for the USDT networks you accept
                </p>

                <div className="input-group">
                  <label>USDT - TRC20 (Tron Network)</label>
                  <input type="text" value={settings.crypto_usdt_trc20_address}
                    onChange={e => setSettings({...settings, crypto_usdt_trc20_address: e.target.value})}
                    placeholder="TRC20 address (starts with T)"
                    style={{ fontSize: '13px', fontFamily: 'monospace' }} />
                </div>

                <div className="input-group">
                  <label>USDT - ERC20 (Ethereum Network)</label>
                  <input type="text" value={settings.crypto_usdt_erc20_address}
                    onChange={e => setSettings({...settings, crypto_usdt_erc20_address: e.target.value})}
                    placeholder="ERC20 address (starts with 0x)"
                    style={{ fontSize: '13px', fontFamily: 'monospace' }} />
                </div>

                <div className="input-group">
                  <label>USDT - BEP20 (BSC Network)</label>
                  <input type="text" value={settings.crypto_usdt_bep20_address}
                    onChange={e => setSettings({...settings, crypto_usdt_bep20_address: e.target.value})}
                    placeholder="BEP20 address (starts with 0x)"
                    style={{ fontSize: '13px', fontFamily: 'monospace' }} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card" style={{ marginBottom: '20px', borderColor: settings.payment_method_paypal === 'true' ? 'var(--accent)' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💳 PayPal
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>International Payments</p>
            </div>
            <button
              className={`btn btn-sm ${settings.payment_method_paypal === 'true' ? 'btn-success' : 'btn-outline'}`}
              onClick={() => toggle('payment_method_paypal')}>
              {settings.payment_method_paypal === 'true' ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {settings.payment_method_paypal === 'true' && (
            <div className="input-group">
              <label>PayPal ID / Email</label>
              <input type="text" value={settings.paypal_id}
                onChange={e => setSettings({...settings, paypal_id: e.target.value})}
                placeholder="yourname@paypal.com" />
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '20px', borderColor: settings.payment_method_bd === 'true' ? 'var(--accent)' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🇧🇩 Bangladesh (bKash / Nagad)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>For Bangladeshi customers</p>
            </div>
            <button
              className={`btn btn-sm ${settings.payment_method_bd === 'true' ? 'btn-success' : 'btn-outline'}`}
              onClick={() => toggle('payment_method_bd')}>
              {settings.payment_method_bd === 'true' ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {settings.payment_method_bd === 'true' && (
            <>
              <div className="input-group">
                <label>bKash Number</label>
                <input type="text" value={settings.bkash_number}
                  onChange={e => setSettings({...settings, bkash_number: e.target.value})}
                  placeholder="01XXXXXXXXX" />
              </div>
              <div className="input-group">
                <label>Nagad Number</label>
                <input type="text" value={settings.nagad_number}
                  onChange={e => setSettings({...settings, nagad_number: e.target.value})}
                  placeholder="01XXXXXXXXX" />
              </div>
            </>
          )}
        </div>

        <div className="card" style={{ marginBottom: '20px', borderColor: settings.payment_method_binance === 'true' ? 'var(--accent)' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🟡 Binance
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Binance Pay / P2P</p>
            </div>
            <button
              className={`btn btn-sm ${settings.payment_method_binance === 'true' ? 'btn-success' : 'btn-outline'}`}
              onClick={() => toggle('payment_method_binance')}>
              {settings.payment_method_binance === 'true' ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {settings.payment_method_binance === 'true' && (
            <div className="input-group">
              <label>Binance UID</label>
              <input type="text" value={settings.binance_uid}
                onChange={e => setSettings({...settings, binance_uid: e.target.value})}
                placeholder="Enter your Binance UID"
                style={{ fontSize: '13px', fontFamily: 'monospace' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                Customers will send payment to this Binance UID
              </p>
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? 'Saving...' : 'Save Payment Settings'}
        </button>
      </div>
    </AdminLayout>
  );
}
