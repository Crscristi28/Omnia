// 📄 PDF GENERATOR - Generate PDF documents from AI responses
// Uses jsPDF library for client-side PDF generation

import jsPDF from 'jspdf';

/**
 * Generate PDF from text content
 * @param {string} content - Text content to convert to PDF
 * @param {string} title - Document title (optional)
 * @param {Object} options - PDF options
 * @returns {Object} - PDF blob and download URL
 */
export const generatePDF = (content, title = 'Document', options = {}) => {
  try {
    const startTime = performance.now();
    
    // Create new jsPDF instance
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4'
    });
    
    // Set font (jsPDF has limited font support)
    pdf.setFont('helvetica', 'normal');
    
    // Add title
    if (title && title.trim()) {
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title.trim(), 20, 25);
      
      // Add separator line
      pdf.setLineWidth(0.5);
      pdf.line(20, 30, 190, 30);
    }
    
    // Add content
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Split text into lines and handle page breaks
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = pageWidth - (margin * 2);
    
    let yPosition = title ? 45 : 25; // Start position
    
    // Split content into paragraphs
    const paragraphs = content.split('\n');
    
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        yPosition += lineHeight; // Empty line
        continue;
      }
      
      // Split long paragraphs into lines that fit the page width
      const lines = pdf.splitTextToSize(paragraph.trim(), maxWidth);
      
      for (const line of lines) {
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
      
      yPosition += lineHeight * 0.5; // Small gap between paragraphs
    }
    
    // Add footer with generation date
    const totalPages = pdf.internal.getNumberOfPages();
    const generatedDate = new Date().toLocaleDateString('cs-CZ');
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Vygenerováno ${generatedDate} | Strana ${i} z ${totalPages}`, margin, pageHeight - 10);
      pdf.text('Vytvořeno pomocí Omnia AI', pageWidth - margin - 40, pageHeight - 10);
    }
    
    // Generate blob and URL
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const duration = Math.round(performance.now() - startTime);
    
    console.log(`✅ [PDF-GENERATOR] PDF generated in ${duration}ms, ${Math.round(pdfBlob.size/1024)}KB`);
    
    return {
      success: true,
      blob: pdfBlob,
      url: pdfUrl,
      filename: `${title.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.pdf`,
      size: pdfBlob.size,
      pages: totalPages,
      generatedAt: new Date().toISOString(),
      processingTime: duration
    };
    
  } catch (error) {
    console.error('❌ [PDF-GENERATOR] Error generating PDF:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate structured PDF (with sections, lists, etc.)
 * @param {Object} structure - Structured content object
 * @param {string} title - Document title
 * @returns {Object} - PDF result
 */
export const generateStructuredPDF = (structure, title = 'Document') => {
  try {
    const pdf = new jsPDF();
    let yPosition = 25;
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition);
    yPosition += 15;
    
    // Process structured content
    for (const section of structure.sections || []) {
      // Check page break
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Section heading
      if (section.heading) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.heading, margin, yPosition);
        yPosition += 10;
      }
      
      // Section content
      if (section.content) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(section.content, pageWidth - (margin * 2));
        
        for (const line of lines) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 7;
        }
      }
      
      // Lists
      if (section.list) {
        pdf.setFontSize(12);
        for (const item of section.list) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(`• ${item}`, margin + 5, yPosition);
          yPosition += 7;
        }
      }
      
      yPosition += 5; // Section separator
    }
    
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    return {
      success: true,
      blob: pdfBlob,
      url: pdfUrl,
      filename: `${title.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.pdf`
    };
    
  } catch (error) {
    console.error('❌ [PDF-GENERATOR] Error generating structured PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clean up PDF URL to prevent memory leaks
 * @param {string} url - PDF URL to revoke
 */
export const cleanupPDFUrl = (url) => {
  try {
    URL.revokeObjectURL(url);
    console.log('🗑️ [PDF-GENERATOR] PDF URL cleaned up');
  } catch (error) {
    console.warn('⚠️ [PDF-GENERATOR] Failed to cleanup PDF URL:', error);
  }
};

// 🧪 DEVELOPMENT TESTING
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.pdfGenerator = {
    generate: generatePDF,
    generateStructured: generateStructuredPDF,
    cleanup: cleanupPDFUrl,
    
    // Test function
    test: () => {
      console.log('🧪 [PDF-GENERATOR] Testing PDF generation...');
      
      const testContent = `Toto je testovací PDF dokument.

Tento dokument byl vytvořen pomocí AI a jsPDF knihovny.

Hlavní funkce:
- Automatické generování PDF
- Podpora českých znaků
- Více stránek
- Záhlaví a zápatí

Konec testovacího dokumentu.`;
      
      const result = generatePDF(testContent, 'Test PDF Dokument');
      
      if (result.success) {
        console.log('✅ Test PDF generated successfully:', result);
        
        // Auto-download for testing
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename;
        link.click();
        
        // Cleanup after 5 seconds
        setTimeout(() => cleanupPDFUrl(result.url), 5000);
      } else {
        console.error('❌ Test PDF generation failed:', result.error);
      }
      
      return result;
    }
  };
  
  console.log('🧪 [PDF-GENERATOR] Dev tools loaded: pdfGenerator.test()');
}