import { useState } from 'react';

const DeleteInstituteModal = ({ institute, onConfirm, onCancel, loading }) => {
  const [confirmText, setConfirmText] = useState('');
  const [forceDelete, setForceDelete] = useState(false);
  const isMatch = confirmText === institute.name;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32, maxWidth: 480,
        width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        color: '#1f2937'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#FEF2F2', borderRadius: 50, padding: 10 }}>
            <span style={{ fontSize: 22 }}>🗑️</span>
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#1E3A5F', fontSize: 18 }}>Delete Institute</h3>
            <p style={{ margin: 0, color: '#6B7280', fontSize: 13 }}>This action cannot be undone</p>
          </div>
        </div>

        {/* Warning box */}
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 8, padding: '12px 16px', marginBottom: 20
        }}>
          <p style={{ margin: 0, color: '#DC2626', fontSize: 13, fontWeight: 600 }}>
            Permanently deletes:
          </p>
          <p style={{ margin: '4px 0 0', color: '#991B1B', fontSize: 12 }}>
            All students, faculty, classes, attendance, fees, payments,
            exams, marks, assignments, chats, notes, timetables and all other data
            belonging to <strong>{institute.name}</strong>.
          </p>
        </div>

        {/* Confirm by typing name */}
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#374151' }}>
          Type <strong>{institute.name}</strong> to confirm:
        </label>
        <input
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder={institute.name}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 6, fontSize: 14,
            border: isMatch ? '2px solid #DC2626' : '1px solid #D1D5DB',
            outline: 'none', boxSizing: 'border-box'
          }}
        />

        {/* Force delete checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13 }}>
          <input type='checkbox' checked={forceDelete}
            onChange={e => setForceDelete(e.target.checked)} />
          Force delete even if active subscription exists
        </label>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #D1D5DB',
              background: '#fff', cursor: 'pointer', fontSize: 14, color: '#4b5563'
            }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(forceDelete)}
            disabled={!isMatch || loading}
            style={{
              flex: 1, padding: '10px', borderRadius: 6, border: 'none',
              background: isMatch ? '#DC2626' : '#FCA5A5',
              color: '#fff', cursor: isMatch ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 600
            }}>
            {loading ? 'Deleting...' : 'Delete Institute'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInstituteModal;
