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
      const response = await api.get(`/maps/builder/${selectedDateId}`);
      setMarketDate(response.data.marketDate);
      setAssignedVendors(response.data.assignedVendors);
      setUnassignedVendors(response.data.unassignedVendors);
      setMessage({ type: '', text: '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load map data' });
    } finally {
      setLoadingData(false);
    }
  }, [selectedDateId]);

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
            ) : (
              <div className="vendor-list">
                {unassignedVendors.map(vendor => (
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
