import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';

const MapBuilder = () => {
  const { dateId } = useParams();
  const [dates, setDates] = useState([]);
  const [selectedDateId, setSelectedDateId] = useState('');
  const [marketDate, setMarketDate] = useState(null);
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [unassignedVendors, setUnassignedVendors] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [allActiveVendors, setAllActiveVendors] = useState([]);
  const [waitlistAddVendorId, setWaitlistAddVendorId] = useState('');
  const [waitlistAddNotes, setWaitlistAddNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [draggedVendor, setDraggedVendor] = useState(null);
  const [highlightedSpots, setHighlightedSpots] = useState([]);
  const [mapConfig, setMapConfig] = useState({ left_spots: 29, right_spots: 25, total_spots: 54 });

  const leftSpots = Array.from({ length: mapConfig.left_spots }, (_, i) => i + 1);
  const rightSpots = Array.from({ length: mapConfig.right_spots }, (_, i) => i + mapConfig.left_spots + 1);

  useEffect(() => {
    fetchMapConfig();
    fetchDates();
  }, []);

  const fetchMapConfig = async () => {
    try {
      const response = await api.get('/settings/map_config');
      setMapConfig(response.data);
    } catch (err) {
      console.error('Error fetching map config:', err);
    }
  };

  const fetchDates = async () => {
    try {
      const response = await api.get('/maps/builder/dates/list');
      setDates(response.data);
      if (dateId) {
        setSelectedDateId(dateId);
      } else if (response.data.length > 0) {
        setSelectedDateId(response.data[0].id.toString());
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load market dates' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBuilderData = useCallback(async () => {
    if (!selectedDateId) return;

    setLoadingData(true);
    try {
      const [builderRes, vendorsRes] = await Promise.all([
        api.get(`/maps/builder/${selectedDateId}`),
        api.get('/admin/vendors')
      ]);
      setMarketDate(builderRes.data.marketDate);
      setAssignedVendors(builderRes.data.assignedVendors);
      setUnassignedVendors(builderRes.data.unassignedVendors);
      setWaitlist(builderRes.data.waitlist || []);
      setAllActiveVendors((vendorsRes.data || []).filter(v => v.is_active));
      setMessage({ type: '', text: '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load map data' });
    } finally {
      setLoadingData(false);
    }
  }, [selectedDateId]);

  const addToWaitlist = async () => {
    if (!waitlistAddVendorId) return;
    try {
      await api.post('/maps/waitlist', {
        market_date_id: parseInt(selectedDateId),
        vendor_id: parseInt(waitlistAddVendorId),
        notes: waitlistAddNotes || null
      });
      setWaitlistAddVendorId('');
      setWaitlistAddNotes('');
      fetchBuilderData();
      setMessage({ type: 'success', text: 'Added to waitlist.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to add to waitlist' });
    }
  };

  const removeFromWaitlist = async (waitlistId) => {
    try {
      await api.delete(`/maps/waitlist/${waitlistId}`);
      fetchBuilderData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to remove from waitlist' });
    }
  };

  const promoteFromWaitlist = async (waitlistId, vendorName) => {
    try {
      await api.post(`/maps/waitlist/${waitlistId}/promote`);
      fetchBuilderData();
      setMessage({ type: 'success', text: `${vendorName} is now in the unassigned list. Drag them onto a spot.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to promote' });
    }
  };

  useEffect(() => {
    if (selectedDateId) {
      fetchBuilderData();
    }
  }, [selectedDateId, fetchBuilderData]);

  const handleDateChange = (e) => {
    setSelectedDateId(e.target.value);
  };

  // Reserved spots
  const reservedSpots = {
    14: 'Music'
  };

  // Get vendor assigned to a specific spot
  const getVendorAtSpot = (spotNum) => {
    if (reservedSpots[spotNum]) {
      return { business_name: reservedSpots[spotNum], reserved: true };
    }
    return assignedVendors.find(v => {
      const spots = v.booth_location.split(',').map(s => parseInt(s.trim()));
      return spots.includes(spotNum);
    });
  };

  // Check if spot is the first spot of a double booth
  const isDoubleBoothStart = (spotNum) => {
    const vendor = getVendorAtSpot(spotNum);
    if (!vendor || vendor.reserved || !vendor.booth_location) return false;
    const spots = vendor.booth_location.split(',').map(s => parseInt(s.trim()));
    return spots.length === 2 && spots[0] === spotNum;
  };

  // Check if spot is the second spot of a double booth (should be skipped in render)
  const isDoubleBoothSecond = (spotNum) => {
    const vendor = getVendorAtSpot(spotNum);
    if (!vendor || vendor.reserved || !vendor.booth_location) return false;
    const spots = vendor.booth_location.split(',').map(s => parseInt(s.trim()));
    return spots.length === 2 && spots[1] === spotNum;
  };

  // Check if spot belongs to a double booth vendor
  const isDoubleBooth = (spotNum) => {
    const vendor = getVendorAtSpot(spotNum);
    if (!vendor || vendor.reserved || !vendor.booth_location) return false;
    const spots = vendor.booth_location.split(',').map(s => parseInt(s.trim()));
    return spots.length === 2;
  };

  // Drag handlers
  const handleDragStart = (e, vendor) => {
    setDraggedVendor(vendor);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedVendor(null);
    setHighlightedSpots([]);
  };

  const handleDragOver = (e, spotNum) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedVendor) return;

    const isDouble = draggedVendor.booth_size === 'double';
    const spots = [spotNum];

    if (isDouble) {
      // For double booth, also highlight the previous spot (going down the list)
      const prevSpot = spotNum - 1;
      const inLeftColumn = spotNum <= 30;
      const prevInSameColumn = inLeftColumn ? prevSpot >= 1 : prevSpot >= 31;
      if (prevInSameColumn) {
        spots.push(prevSpot);
      }
    }

    setHighlightedSpots(spots);
  };

  const handleDragLeave = () => {
    setHighlightedSpots([]);
  };

  const handleDrop = async (e, spotNum) => {
    e.preventDefault();
    e.stopPropagation();
    setHighlightedSpots([]);

    if (!draggedVendor) return;

    const isDouble = draggedVendor.booth_size === 'double';
    let boothLocation = spotNum.toString();

    if (isDouble) {
      const prevSpot = spotNum - 1;
      const inLeftColumn = spotNum <= 30;
      const prevInSameColumn = inLeftColumn ? prevSpot >= 1 : prevSpot >= 31;

      if (!prevInSameColumn) {
        setMessage({ type: 'error', text: 'Cannot place double booth here - not enough space in column' });
        return;
      }

      // Check if prev spot is free
      if (getVendorAtSpot(prevSpot)) {
        setMessage({ type: 'error', text: `Spot ${prevSpot} is already occupied` });
        return;
      }

      boothLocation = `${spotNum},${prevSpot}`;
    }

    // Check if current spot is free
    if (getVendorAtSpot(spotNum)) {
      setMessage({ type: 'error', text: `Spot ${spotNum} is already occupied` });
      return;
    }

    // Warn before placing an unpaid vendor
    if (!draggedVendor.is_paid) {
      const owed = parseFloat(draggedVendor.outstanding_amount).toFixed(2);
      const ok = window.confirm(`${draggedVendor.business_name} has $${owed} unpaid. Place anyway?`);
      if (!ok) {
        setDraggedVendor(null);
        return;
      }
    }

    try {
      await api.put('/maps/assign', {
        booking_id: draggedVendor.booking_id,
        booth_location: boothLocation
      });
      setMessage({ type: 'success', text: `${draggedVendor.business_name} assigned to spot ${boothLocation}` });
      fetchBuilderData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to assign vendor' });
    }

    setDraggedVendor(null);
  };

  const handleUnassign = async (vendor) => {
    try {
      await api.put('/maps/assign', {
        booking_id: vendor.booking_id,
        booth_location: null
      });
      setMessage({ type: 'success', text: `${vendor.business_name} unassigned from spot ${vendor.booth_location}` });
      fetchBuilderData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to unassign vendor' });
    }
  };

  const formatDate = (dateStr) => dateStr;


  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div className="map-builder">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Map Builder</h1>
          <p className="page-subtitle">Drag vendors from the sidebar to assign booth spots</p>
        </div>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '250px' }}>
          <select
            value={selectedDateId}
            onChange={handleDateChange}
            style={{ padding: '10px 12px' }}
          >
            {dates.map(d => (
              <option key={d.id} value={d.id}>
                {formatDate(d.date)} {d.is_cancelled ? '(Cancelled)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      {loadingData ? (
        <div className="text-center mt-4">
          <span className="spinner"></span>
        </div>
      ) : (
        <div className="map-builder-container">
          {/* Sidebar with unassigned vendors */}
          <div className="map-sidebar">
            <h3>Unassigned Vendors ({unassignedVendors.length})</h3>
            {unassignedVendors.length === 0 ? (
              <p className="no-vendors">All vendors assigned!</p>
            ) : (() => {
              const paid = unassignedVendors.filter(v => v.is_paid);
              const unpaid = unassignedVendors.filter(v => !v.is_paid);
              return (
                <>
                  <div style={{ marginTop: '12px', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Paid ({paid.length}) — can place
                  </div>
                  {paid.length === 0 ? (
                    <p className="no-vendors" style={{ fontSize: '13px', color: '#999' }}>No paid vendors waiting.</p>
                  ) : (
                    <div className="vendor-list">
                      {paid.map(vendor => (
                        <div
                          key={vendor.booking_id}
                          className={`vendor-card ${vendor.booth_size}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, vendor)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="vendor-name">{vendor.business_name}</div>
                          <div className="vendor-size">
                            {vendor.booth_size === 'double' ? 'Double Booth' : 'Single Booth'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '20px', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Unpaid ({unpaid.length}) — do not place
                  </div>
                  {unpaid.length === 0 ? (
                    <p className="no-vendors" style={{ fontSize: '13px', color: '#999' }}>No unpaid vendors waiting.</p>
                  ) : (
                    <div className="vendor-list">
                      {unpaid.map(vendor => (
                        <div
                          key={vendor.booking_id}
                          className={`vendor-card ${vendor.booth_size}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, vendor)}
                          onDragEnd={handleDragEnd}
                          style={{ borderLeft: '4px solid #dc2626', opacity: 0.85 }}
                        >
                          <div className="vendor-name">{vendor.business_name}</div>
                          <div className="vendor-size">
                            {vendor.booth_size === 'double' ? 'Double Booth' : 'Single Booth'} · ${parseFloat(vendor.outstanding_amount).toFixed(2)} owed
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Waitlist panel */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Waitlist ({waitlist.length})
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 10px 0' }}>
                FIFO. Top of list is first in line.
              </p>

              {waitlist.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#999', margin: '0 0 12px 0' }}>No one on the waitlist for this date.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {waitlist.map((entry, idx) => (
                    <div
                      key={entry.waitlist_id}
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderLeft: idx === 0 ? '4px solid #2563eb' : '1px solid #e5e7eb',
                        borderRadius: '4px',
                        padding: '8px 10px',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {idx + 1}. {entry.business_name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        {entry.booth_size === 'double' ? 'Double' : 'Single'}
                        {entry.is_paid ? ' · Paid' : ` · $${parseFloat(entry.outstanding_amount).toFixed(2)} owed`}
                      </div>
                      {entry.notes && (
                        <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginTop: '2px' }}>
                          {entry.notes}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button
                          onClick={() => promoteFromWaitlist(entry.waitlist_id, entry.business_name)}
                          style={{ fontSize: '11px', padding: '4px 8px', border: '1px solid #16a34a', background: '#16a34a', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Promote
                        </button>
                        <button
                          onClick={() => removeFromWaitlist(entry.waitlist_id)}
                          style={{ fontSize: '11px', padding: '4px 8px', border: '1px solid #dc2626', background: '#fff', color: '#dc2626', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add to waitlist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <select
                  value={waitlistAddVendorId}
                  onChange={(e) => setWaitlistAddVendorId(e.target.value)}
                  style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                >
                  <option value="">Add vendor to waitlist…</option>
                  {allActiveVendors
                    .filter(v => !waitlist.some(w => w.vendor_id === v.id))
                    .map(v => (
                      <option key={v.id} value={v.id}>{v.business_name}</option>
                    ))}
                </select>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={waitlistAddNotes}
                  onChange={(e) => setWaitlistAddNotes(e.target.value)}
                  style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
                <button
                  onClick={addToWaitlist}
                  disabled={!waitlistAddVendorId}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid #2563eb',
                    background: waitlistAddVendorId ? '#2563eb' : '#e5e7eb',
                    color: waitlistAddVendorId ? '#fff' : '#999',
                    cursor: waitlistAddVendorId ? 'pointer' : 'not-allowed'
                  }}
                >
                  Add to Waitlist
                </button>
              </div>
            </div>
          </div>

          {/* Map grid */}
          <div className="map-grid-container">
            <div className="map-columns">
              {/* East Side */}
              <table className="map-table">
                <thead>
                  <tr>
                    <th colSpan="2">East Side (1-30)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 30 }, (_, i) => {
                    const spot = 30 - i;
                    const vendor = getVendorAtSpot(spot);
                    const isSecond = isDoubleBoothSecond(spot);
                    const isDouble = isDoubleBooth(spot);

                    return (
                      <tr key={spot}>
                        <td className={`spot-number-cell ${vendor ? 'occupied' : 'empty'} ${isDouble ? 'double' : ''} ${highlightedSpots.includes(spot) ? 'highlighted' : ''}`}>
                          {spot}
                        </td>
                        <td
                          className={`spot-vendor-cell ${vendor ? 'occupied' : 'empty'} ${isDouble ? 'double' : ''} ${vendor?.reserved ? 'reserved' : ''} ${highlightedSpots.includes(spot) ? 'highlighted' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); !vendor && handleDragOver(e, spot); }}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => !vendor && handleDrop(e, spot)}
                        >
                          {vendor ? (
                            vendor.reserved ? (
                              <span className="reserved-label">{vendor.business_name}</span>
                            ) : (
                              <span onClick={() => handleUnassign(vendor)} title="Click to unassign">
                                {vendor.business_name}{isSecond ? ' x2' : ''}
                              </span>
                            )
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Street */}
              <div className="street-divider">
                <div className="street-label">MAIN ST</div>
              </div>

              {/* West Side */}
              <table className="map-table">
                <thead>
                  <tr>
                    <th colSpan="2">West Side (31-55)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 25 }, (_, i) => {
                    const spot = 55 - i;
                    const vendor = getVendorAtSpot(spot);
                    const isSecond = isDoubleBoothSecond(spot);
                    const isDouble = isDoubleBooth(spot);

                    return (
                      <tr key={spot}>
                        <td
                          className={`spot-vendor-cell right ${vendor ? 'occupied' : 'empty'} ${isDouble ? 'double' : ''} ${highlightedSpots.includes(spot) ? 'highlighted' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); !vendor && handleDragOver(e, spot); }}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => !vendor && handleDrop(e, spot)}
                        >
                          {vendor ? (
                            <span onClick={() => handleUnassign(vendor)} title="Click to unassign">
                              {vendor.business_name}{isSecond ? ' x2' : ''}
                            </span>
                          ) : null}
                        </td>
                        <td className={`spot-number-cell ${vendor ? 'occupied' : 'empty'} ${isDouble ? 'double' : ''} ${highlightedSpots.includes(spot) ? 'highlighted' : ''}`}>
                          {spot}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="map-legend card mt-3">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color empty"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupied"></div>
            <span>Assigned (click to unassign)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color double"></div>
            <span>Double Booth</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapBuilder;
