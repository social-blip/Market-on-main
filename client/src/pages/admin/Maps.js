import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AdminMaps = () => {
  const [maps, setMaps] = useState([]);
  const [currentMap, setCurrentMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMaps();
  }, []);

  const fetchMaps = async () => {
    try {
      const response = await api.get('/maps');
      setCurrentMap(response.data);
    } catch (err) {
      // No map exists yet, that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('map', file);

    try {
      const response = await api.post('/maps', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCurrentMap(response.data);
      setMessage({ type: 'success', text: 'Map uploaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload map. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Market Maps</h1>
        <p className="page-subtitle">Upload and manage the market layout map</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      <div className="grid grid-2">
        {/* Upload */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Upload New Map</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Upload an image of the market layout. Supported formats: JPG, PNG, GIF, WebP (max 10MB).
          </p>

          <label
            style={{
              display: 'block',
              padding: '40px',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#fafafa'
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            {uploading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                <div style={{ color: '#666' }}>Click to upload map image</div>
              </>
            )}
          </label>
        </div>

        {/* Current Map */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Current Map</h3>

          {currentMap && currentMap.image_url ? (
            <div>
              <img
                src={currentMap.image_url}
                alt="Market Map"
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Uploaded: {new Date(currentMap.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ color: '#666' }}>No map uploaded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card mt-3">
        <h3 style={{ marginBottom: '16px' }}>Tips for Market Maps</h3>
        <ul style={{ color: '#666', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Use a clear, high-resolution image of the market layout</li>
          <li style={{ marginBottom: '8px' }}>Label booth locations so vendors can find their spots</li>
          <li style={{ marginBottom: '8px' }}>Include landmarks like streets, parking areas, and restrooms</li>
          <li style={{ marginBottom: '8px' }}>Update the map if the layout changes for special events</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminMaps;
