// 📚 Clean PDF Viewer Component
// Using @react-pdf-viewer/core library for professional PDF viewing

import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PdfViewer = ({
  isOpen,
  onClose,
  pdfData, // { url, title, base64 }
}) => {
  if (!isOpen) return null;

  // Create the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 100000,  // 10x higher than highest Omnia UI (10000)
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
          backgroundColor: 'white'
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfData?.url}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      </div>
    </div>
  );
};

export default PdfViewer;