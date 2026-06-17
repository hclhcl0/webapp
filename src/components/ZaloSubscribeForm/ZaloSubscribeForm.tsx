'use client';

import { useState } from 'react';

interface ZaloSubscribeFormProps {
  className?: string;
  title?: string;
  description?: string;
  compact?: boolean; // chế độ nhỏ gọn cho sidebar/footer
}

export default function ZaloSubscribeForm({
  className = '',
  title = 'Đăng ký nhận tin qua Zalo',
  description = 'Để lại số điện thoại, chúng tôi sẽ liên hệ gửi thông tin sức khỏe, lịch tiêm chủng và các thông báo y tế quan trọng qua Zalo.',
  compact = false,
}: ZaloSubscribeFormProps) {
  const [form, setForm] = useState({ fullName: '', phone: '', dob: '', cccd: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/zalo/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ type: 'success', message: data.message });
        setForm({ fullName: '', phone: '', dob: '', cccd: '' });
      } else {
        setResult({ type: 'error', message: data.error || 'Có lỗi xảy ra. Vui lòng thử lại.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Không kết nối được máy chủ.' });
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`zalo-subscribe-compact ${className}`}>
        <div className="zalo-subscribe-compact__header">
          <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo" width={20} height={20} />
          <span>{title}</span>
        </div>
        {result ? (
          <div className={`zalo-subscribe-compact__result zalo-subscribe-compact__result--${result.type}`}>
            {result.type === 'success' ? '✅' : '❌'} {result.message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="zalo-subscribe-compact__form">
            <input
              type="tel"
              placeholder="Số điện thoại Zalo *"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Họ và tên"
              value={form.fullName}
              onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
            />
            <button type="submit" disabled={loading || !form.phone.trim()}>
              {loading ? 'Đang gửi...' : '📱 Đăng ký nhận tin'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className={`zalo-subscribe ${className}`}>
      <div className="zalo-subscribe__icon">
        <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo" width={40} height={40} />
      </div>
      <h3 className="zalo-subscribe__title">{title}</h3>
      <p className="zalo-subscribe__desc">{description}</p>

      {result ? (
        <div className={`zalo-subscribe__result zalo-subscribe__result--${result.type}`}>
          <span>{result.type === 'success' ? '✅' : '❌'}</span>
          <span>{result.message}</span>
          {result.type === 'success' && (
            <button onClick={() => setResult(null)} className="zalo-subscribe__reset">
              Đăng ký thêm
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="zalo-subscribe__form">
          <div className="zalo-subscribe__row">
            <div className="zalo-subscribe__field">
              <label>Họ và tên</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="zalo-subscribe__field zalo-subscribe__field--required">
              <label>Số điện thoại Zalo <span>*</span></label>
              <input
                type="tel"
                placeholder="0901 234 567"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="zalo-subscribe__row">
            <div className="zalo-subscribe__field">
              <label>Ngày sinh</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={form.dob}
                onChange={(e) => setForm(f => ({ ...f, dob: e.target.value }))}
              />
            </div>
            <div className="zalo-subscribe__field">
              <label>CCCD / Mã bệnh nhân</label>
              <input
                type="text"
                placeholder="0123456789"
                value={form.cccd}
                onChange={(e) => setForm(f => ({ ...f, cccd: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" disabled={loading || !form.phone.trim()} className="zalo-subscribe__btn">
            {loading
              ? <><span className="zalo-subscribe__spinner" />Đang đăng ký...</>
              : <>📱 Đăng ký nhận tin qua Zalo</>
            }
          </button>
          <p className="zalo-subscribe__note">
            🔒 Thông tin của bạn được bảo mật tuyệt đối. Bạn có thể hủy nhận tin bất cứ lúc nào.
          </p>
        </form>
      )}
    </div>
  );
}
