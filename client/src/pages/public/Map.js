import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const Map = () => {
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMap();
  }, []);

  const fetchMap = async () => {
    try {
      const response = await api.get('/maps');
      setMap(response.data);
    } catch (err) {
      console.error('Error fetching map:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div className="page-header text-center">
        <h1 className="page-title">Market Map</h1>
        <p className="page-subtitle">Find your favorite vendors at the market</p>
      </div>

      {map && map.image_url ? (
        <div className="card text-center">
          <img
            src={map.image_url}
            alt="Market Map"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
          />
        </div>
      ) : (
        <div className="card text-center">
          <p style={{ color: '#666', padding: '40px' }}>
            Market map coming soon! Check back closer to the market opening.
          </p>
        </div>
      )}

      <div className="card mt-3">
        <h3 style={{ marginBottom: '16px' }}>Getting There</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Market on Main is located on the 100 Block of Main Ave N in Downtown Twin Falls, Idaho.
        </p>
        <div className="grid grid-2">
          <div>
            <h4 style={{ marginBottom: '8px' }}>Address</h4>
            <p style={{ color: '#666' }}>
              100 Block of Main Ave N<br />
              Twin Falls, ID 83301
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '8px' }}>Parking</h4>
            <p style={{ color: '#666' }}>
              Free street parking is available throughout downtown.
              Additional parking available in nearby lots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
