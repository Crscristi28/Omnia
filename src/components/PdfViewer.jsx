// 📚 Clean PDF Viewer Component
// Using @react-pdf-viewer/core library for professional PDF viewing

import React from 'react';

const PdfViewer = ({
  isOpen,
  onClose,
  pdfData, // { url, title, base64 }
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClose}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          {pdfData?.title || 'PDF Document'}
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '20px'
          }}
        >
          ✕
        </button>
      </div>

      {/* PDF Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* TODO: Replace with @react-pdf-viewer component */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          color: '#333'
        }}>
          <h3>Clean PDF Viewer</h3>
          <p>@react-pdf-viewer library will be installed here</p>
          <p>Title: {pdfData?.title}</p>
          <p>Data available: {pdfData?.url ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;