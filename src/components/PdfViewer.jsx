// 📚 Clean PDF Viewer Component
// Using @react-pdf-viewer/core library for professional PDF viewing

import React from 'react';
import ReactDOM from 'react-dom';
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

  // Create modal body function (like official example)
  const modalBody = () => (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        zIndex: 9999,  // Official recommended z-index
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
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
          flexGrow: 1,
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

  // Use ReactDOM.createPortal to render modal in document.body (official approach)
  return ReactDOM.createPortal(modalBody(), document.body);
};

export default PdfViewer;