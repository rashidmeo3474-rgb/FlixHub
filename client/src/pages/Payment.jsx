import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money } from '../utils/format.js';

const normalizeMethod = (value) => {
  if (!value) return 'jazzcash';
  const normalized = String(value).toLowerCase();
  if (normalized.includes('jazz')) return 'jazzcash';
  if (normalized.includes('ease')) return 'easypaisa';
  if (normalized.includes('naya')) return 'nayapay';
  if (normalized.includes('ubl')) return 'ubl';
  if (normalized.includes('mcb')) return 'mcb';
  if (normalized.includes('visa') || normalized.includes('master')) return 'card';
  return normalized;
};

export default function Payment() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { total, clear } = useCart();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [methods, setMethods] = useState([]);
  const [method, setMethod] = useState('jazzcash');
  const [form, setForm] = useState({ transactionId: '', amountPaid: '', notes: '' });
  const [files, setFiles] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  useEffect(() => {
    api.get('/payments/methods').then(({ data }) => {
      setMethods(data.methods || []);
      const initial = normalizeMethod(state?.paymentMethod || state?.intent?.provider || 'jazzcash');
      setMethod(initial);
      const match = (data.methods || []).find((item) => item.key === initial);
      if (!match && data.methods?.length) setMethod(data.methods[0].key);
    }).catch(() => setMethods([])).finally(() => setLoadingMethods(false));
  }, [state?.paymentMethod]);

  const pay = async () => {
    setBusy(true); setError(null);
    try {
      const payload = new FormData();
      payload.append('paymentMethod', method);
      payload.append('transactionId', form.transactionId);
      payload.append('amountPaid', form.amountPaid || '0');
      payload.append('notes', form.notes);
      Array.from(files).forEach((file) => payload.append('files', file));

      const { data } = await api.post(`/payments/${orderId}/proof`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      clear();
      navigate(`/success/${data.order?.reference || orderId}`, { replace: true, state: { proof: data.proof, order: data.order } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const selectedMethod = methods.find((item) => item.key === method) || methods[0] || {};

  const copyValue = async (value) => {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); } catch {}
  };

  return (
    <section className="wrap-xs section" style={{ paddingTop: 60 }}>
      <div className="card stack">
        <span className="label">{state?.intent?.provider || selectedMethod.label || t('paymentDetails')}</span>
        <h1 style={{ fontSize: 24 }}>{t('pay')} {money(state?.intent?.amount ?? total)}</h1>
        <p className="muted" style={{ fontSize: 14.5 }}>
          {t('heroSub')}
        </p>
        {state?.reference && <div className="cred-row"><span className="muted">reference</span><span>{state.reference}</span></div>}
        <div className="card stack" style={{ background: 'var(--card-alt, #f8f9ff)', border: '1px solid var(--line)' }}>
          <span className="label">{t('paymentDetails')}</span>
          {loadingMethods ? <p className="muted">Loading payment methods…</p> : (
            <>
              <div className="stack" style={{ gap: 8 }}>
                {methods.map((item) => (
                  <button type="button" key={item.key} onClick={() => setMethod(item.key)} className={method === item.key ? 'duration active' : 'duration'} style={{ justifyContent: 'space-between' }}>
                    <span>{item.label}</span>
                    <span>{method === item.key ? '●' : '○'}</span>
                  </button>
                ))}
              </div>
              {selectedMethod && (
                <div className="stack" style={{ gap: 8, marginTop: 8 }}>
                  <h2 style={{ fontSize: 18, margin: 0 }}>{selectedMethod.label}</h2>
                  <p className="muted" style={{ fontSize: 14.5, margin: 0 }}>{selectedMethod.instructions || 'Send the payment to the account details below and upload proof.'}</p>
                  {['accountName', 'mobileNumber', 'accountNumber', 'iban'].filter((key) => selectedMethod[key]).map((key) => (
                    <div key={key} className="spread" style={{ borderTop: '1px dashed var(--line)', paddingTop: 8, gap: 12 }}>
                      <span className="muted" style={{ fontSize: 13 }}>{key === 'mobileNumber' ? 'Mobile Number' : key === 'accountNumber' ? 'Account Number' : key === 'iban' ? 'IBAN' : 'Account Name'}</span>
                      <strong style={{ fontSize: 14, textAlign: 'right', whiteSpace: 'normal' }}>{selectedMethod[key]}</strong>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => copyValue(selectedMethod[key])}>Copy</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="field">
          <label className="label" htmlFor="transactionId">Transaction ID / Reference</label>
          <input id="transactionId" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} placeholder="Optional" />
        </div>
        <div className="field">
          <label className="label" htmlFor="amountPaid">Amount paid</label>
          <input id="amountPaid" type="number" min="0" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} placeholder="0" required />
        </div>
        <div className="field">
          <label className="label" htmlFor="notes">Notes</label>
          <textarea id="notes" rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
        </div>
        <div className="field">
          <label className="label" htmlFor="files">Upload payment proof</label>
          <input id="files" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setFiles(e.target.files)} />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-block" onClick={pay} disabled={busy}>
          {busy ? t('loading') : `${t('pay')} →`}
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => navigate('/cart')}>{t('back')}</button>
      </div>
    </section>
  );
}
