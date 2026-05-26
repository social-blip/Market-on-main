import React from 'react';

const VendorDocuments = () => {
  const documents = [
    {
      title: 'Market on Main Vendor Agreement',
      description: 'Official 2026 vendor agreement. Please review and keep for your records.',
      url: '/uploads/documents/MOM-Vendor-Agreement.pdf',
      filename: 'MOM-Vendor-Agreement.pdf'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="vendor-page__header">
        <h1 className="vendor-page__title">Documents</h1>
        <p className="vendor-page__subtitle">
          Important documents for the 2026 season
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {documents.map(doc => (
          <div
            key={doc.filename}
            className="vendor-card"
            style={{
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#333' }}>
                {doc.title}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {doc.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#fff',
                  color: '#5c1e3d',
                  border: '1px solid #5c1e3d',
                  padding: '10px 20px',
                  borderRadius: '100px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                View
              </a>
              <a
                href={doc.url}
                download={doc.filename}
                style={{
                  background: '#5c1e3d',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '100px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorDocuments;
