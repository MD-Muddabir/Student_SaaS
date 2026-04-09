const SuspendedPage = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#F8FAFC'
  }}>
    <div style={{
      maxWidth: 480, width: '90%', background: '#fff', borderRadius: 16,
      padding: 48, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      borderTop: '4px solid #D97706'
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⏸️</div>
      <h1 style={{ color: '#1E3A5F', marginBottom: 12 }}>Account Suspended</h1>
      <p style={{ color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
        Your institute account has been temporarily suspended.
        Please contact support to resolve this issue.
      </p>
      <a href="mailto:support@yoursaas.com"
        style={{ color: '#2563EB', fontSize: 14 }}>
        support@yoursaas.com
      </a>
      <div style={{ marginTop: 24 }}>
        <button onClick={() => window.location.href = '/login'} style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', textDecoration: 'underline' }}>
          Back to Login
        </button>
      </div>
    </div>
  </div>
);

export default SuspendedPage;
