import { useState } from 'react';

const SuspendInstituteModal = ({ institute, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState('');
  const isSuspended = institute.status === 'suspended';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32, maxWidth: 440,
        width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        color: '#1f2937'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: isSuspended ? '#F0FDF4' : '#FFFBEB', borderRadius: 50, padding: 10 }}>
            <span style={{ fontSize: 22 }}>{isSuspended ? '✅' : '⏸️'}</span>
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#1E3A5F', fontSize: 18 }}>
              {isSuspended ? 'Restore Institute' : 'Suspend Institute'}
            </h3>
            <p style={{ margin: 0, color: '#6B7280', fontSize: 13 }}>
              {isSuspended
                ? 'Institute will be able to login again'
                : 'All users will be blocked from login'
              }
            </p>
          </div>
        </div>

        <div style={{
          background: isSuspended ? '#F0FDF4' : '#FFFBEB',
          border: `1px solid ${isSuspended ? '#BBF7D0' : '#FDE68A'}`,
          borderRadius: 8, padding: '12px 16px', marginBottom: 20
        }}>
          <p style={{ margin: 0, fontSize: 13, color: isSuspended ? '#166534' : '#92400E' }}>
            {isSuspended
              ? `Restoring ${institute.name} will allow all their admins, faculty, and students to log in again.`
              : `Suspending ${institute.name} will immediately block all their users from accessing the platform.`
            }
          </p>
        </div>

        {!isSuspended && (
          <>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#374151' }}>
              Reason (optional):
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Payment overdue, Policy violation..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 6, fontSize: 13,
                border: '1px solid #D1D5DB', outline: 'none',
                resize: 'none', boxSizing: 'border-box'
              }}
            />
          </>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: 6,
              border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#4b5563'
            }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            style={{
              flex: 1, padding: '10px', borderRadius: 6, border: 'none',
              background: isSuspended ? '#16A34A' : '#D97706',
              color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600
            }}>
            {loading ? 'Processing...' : (isSuspended ? 'Restore Institute' : 'Suspend Institute')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendInstituteModal;
