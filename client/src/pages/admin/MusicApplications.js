import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AdminMusicApplications = () => {
  const [musicians, setMusicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMusician, setSelectedMusician] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  // Editable fields for detail panel
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editBio, setEditBio] = useState('');

  useEffect(() => {
    fetchMusicians();
  }, []);

  useEffect(() => {
    if (selectedMusician) {
      setEditName(selectedMusician.name || '');
      setEditEmail(selectedMusician.email || '');
      setEditPhone(selectedMusician.phone || '');
      setEditWebsite(selectedMusician.website || '');
      setEditBio(selectedMusician.bio || '');
    }
  }, [selectedMusician?.id]);

  const fetchMusicians = async () => {
    try {
      const response = await api.get('/music-applications');
      setMusicians(response.data);
    } catch (err) {
      console.error('Error fetching musicians:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMusician = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const response = await api.post('/music-applications', { name: newName.trim() });
      setMusicians(prev => [response.data, ...prev]);
      setNewName('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding musician:', err);
    } finally {
      setAdding(false);
    }
  };

  const saveMusician = async () => {
    if (!selectedMusician) return;
    setSaving(true);
    try {
      const response = await api.put(`/music-applications/${selectedMusician.id}`, {
        name: editName,
        email: editEmail || null,
        phone: editPhone || null,
        website: editWebsite || null,
        bio: editBio || null
      });
      setMusicians(prev =>
        prev.map(m => m.id === selectedMusician.id ? response.data : m)
      );
      setSelectedMusician(response.data);
    } catch (err) {
      console.error('Error saving musician:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteMusician = async (id) => {
    if (!window.confirm('Are you sure you want to delete this musician?')) return;
    try {
      await api.delete(`/music-applications/${id}`);
      setMusicians(prev => prev.filter(m => m.id !== id));
      if (selectedMusician?.id === id) {
        setSelectedMusician(null);
      }
    } catch (err) {
      console.error('Error deleting musician:', err);
    }
  };

  const hasChanges = selectedMusician && (
    editName !== (selectedMusician.name || '') ||
    editEmail !== (selectedMusician.email || '') ||
    editPhone !== (selectedMusician.phone || '') ||
    editWebsite !== (selectedMusician.website || '') ||
    editBio !== (selectedMusician.bio || '')
  );

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-1">
        <h1 style={{ margin: 0 }}>Musicians</h1>
        <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ fontSize: '13px' }}>
          + Add Musician
        </button>
      </div>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '24px' }}>{musicians.length} musicians</p>

      {/* Add Musician Form */}
      {showAddForm && (
        <div className="card mb-3">
          <h4 style={{ marginBottom: '12px' }}>Add Musician</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Musician / band name"
              onKeyDown={(e) => e.key === 'Enter' && addMusician()}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              autoFocus
            />
            <button onClick={addMusician} disabled={adding || !newName.trim()} className="btn btn-primary" style={{ fontSize: '13px' }}>
              {adding ? 'Adding...' : 'Add'}
            </button>
            <button onClick={() => { setShowAddForm(false); setNewName(''); }} className="btn btn-secondary" style={{ fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Musicians List */}
        <div style={{ flex: selectedMusician ? '0 0 400px' : '1' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {musicians.length === 0 ? (
              <div className="card text-center" style={{ padding: '40px', color: 'var(--gray)' }}>
                No musicians yet. Click "Add Musician" to get started.
              </div>
            ) : (
              musicians.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMusician(m)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedMusician?.id === m.id ? 'var(--maroon)' : undefined,
                    background: '#fff'
                  }}
                >
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      {m.email && <div style={{ fontSize: '12px', color: 'var(--gray)' }}>{m.email}</div>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedMusician && (
          <div style={{ flex: 1 }}>
            <div className="card">
              <div className="flex-between mb-3">
                <h2 style={{ margin: 0 }}>{selectedMusician.name}</h2>
                <button onClick={() => setSelectedMusician(null)} className="btn btn-secondary" style={{ padding: '4px 12px' }}>×</button>
              </div>

              {/* Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray-dark)', marginBottom: '4px' }}>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray-dark)', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Optional"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray-dark)', marginBottom: '4px' }}>Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Optional"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              {/* Website */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray-dark)', marginBottom: '4px' }}>Website</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray-dark)', marginBottom: '4px' }}>Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write a short bio for this musician..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Save */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  onClick={saveMusician}
                  disabled={saving || !hasChanges}
                  className="btn btn-primary"
                  style={{ fontSize: '13px', opacity: saving || !hasChanges ? 0.5 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteMusician(selectedMusician.id)}
                className="btn btn-danger"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Delete Musician
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMusicApplications;
