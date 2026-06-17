export const metadata = { title: 'Người quan tâm OA — Cổng nhân viên' };
export const dynamic = 'force-dynamic';

export default function FollowersPortalPage() {
  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
        👥 Danh sách người quan tâm OA
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>
        Danh sách người đã quan tâm Zalo OA hoặc đăng ký nhận tin qua trang chủ.
      </p>
      <div style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
        padding: '48px', textAlign: 'center', color: '#94a3b8',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '8px' }}>Đang phát triển</div>
        <div style={{ fontSize: '0.85rem' }}>Danh sách người quan tâm sẽ được hiển thị ở đây.</div>
      </div>
    </div>
  );
}
