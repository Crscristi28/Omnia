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
        backgroundColor: '#ffffff',  // Clean white background
        zIndex: 999999,  // 🔧 FIX: Much higher z-index to go OVER Omnia UI
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Full-screen PDF Content - NO UI ELEMENTS */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          height: '100vh',
          width: '100vw'
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfData?.url}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      </div>

      {/* Invisible close area - click anywhere to close */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 9999999,  // Even higher than PDF container
          backgroundColor: 'transparent'
        }}
        title="Click to close"
      />
    </div>
  );
};

export default PdfViewer;