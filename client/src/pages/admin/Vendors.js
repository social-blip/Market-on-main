import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/admin/vendors');
      setVendors(response.data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    if (filter === 'active' && !v.is_active) return false;
    if (filter === 'pending' && (v.is_active || v.application_status !== 'pending')) return false;
    if (filter === 'inactive' && (v.is_active || v.application_status === 'pending')) return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        v.business_name?.toLowerCase().includes(search) ||
        v.contact_name?.toLowerCase().includes(search) ||
        v.email?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const activeCount = vendors.filter(v => v.is_active).length;
  const pendingCount = vendors.filter(v => v.application_status === 'pending' || (!v.is_active && !v.is_approved)).length;
  const inactiveCount = vendors.filter(v => !v.is_active && v.application_status !== 'pending' && v.is_approved).length;

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2">Vendors</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '24px' }}>{vendors.length} total vendors</p>

      {/* Filters & Search */}
      <div className="card mb-3">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'All', count: vendors.length },
              { key: 'active', label: 'Active', count: activeCount },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'inactive', label: 'Inactive', count: inactiveCount }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={filter === key ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ fontSize: '13px', padding: '8px 14px' }}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', minWidth: '200px' }}
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Contact</th>
              <th>Booth</th>
              <th>Markets</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center" style={{ padding: '40px', color: 'var(--gray)' }}>
                  No vendors found.
                </td>
              </tr>
            ) : (
              filteredVendors.map(vendor => (
                <tr key={vendor.id} style={{ background: vendor.application_status === 'pending' ? '#fff9e6' : undefined }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{vendor.business_name}</div>
                    {vendor.is_nonprofit && <span className="badge badge-info" style={{ fontSize: '10px' }}>Nonprofit</span>}
                  </td>
                  <td>
                    <div>{vendor.contact_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray)' }}>{vendor.email}</div>
                  </td>
                  <td>
                    {vendor.booth_size === 'double' ? '20×10' : '10×10'}
                    {vendor.needs_power && <span title="Needs Power"> ⚡</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{vendor.booking_count || 0}</td>
                  <td>
                    {vendor.application_status === 'pending' || (!vendor.is_active && !vendor.is_approved) ? (
                      <span className="badge badge-warning">Pending</span>
                    ) : vendor.is_active ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/admin/vendors/${vendor.id}`}
                      className={vendor.application_status === 'pending' ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      {vendor.application_status === 'pending' ? 'Review' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVendors;
