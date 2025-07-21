import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { IncomingForm } from 'formidable';
import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';
import fs from 'fs';

// Tell Vercel not to parse the body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Error processing file upload' });
      }

      const file = files.file?.[0] || files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      try {
        // Initialize Document AI client
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        const client = new DocumentProcessorServiceClient({
          credentials: credentials,
          apiEndpoint: `${process.env.DOCUMENT_AI_LOCATION}-documentai.googleapis.com`
        });

        // Initialize Cloud Storage
        const storage = new Storage({
          credentials: credentials,
          projectId: credentials.project_id
        });

        const projectId = credentials.project_id;
        const location = process.env.DOCUMENT_AI_LOCATION;
        const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

        // Construct processor path
        const name = client.processorPath(projectId, location, processorId);
        
        // Read file content
        const originalFileContent = fs.readFileSync(file.filepath);
        
        // Create request
        const request = {
          name: name,
          rawDocument: {
            content: originalFileContent.toString('base64'),
            mimeType: 'application/pdf',
          },
        };

        // Process document
        const [result] = await client.processDocument(request);
        const { document } = result;

        // Generate unique filenames
        const timestamp = Date.now();
        const randomId = crypto.randomBytes(8).toString('hex');
        const textFileName = `documents/text/${timestamp}-${randomId}.txt`;
        const pdfFileName = `documents/pdf/${timestamp}-${randomId}.pdf`;

        // Upload extracted text to Cloud Storage
        const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET);
        const textBlob = bucket.file(textFileName);

        await textBlob.save(document.text || '', {
          metadata: {
            contentType: 'text/plain',
            metadata: {
              originalName: file.originalFilename || file.name,
              uploadedAt: new Date().toISOString(),
              pageCount: document.pages ? document.pages.length.toString() : '0'
            }
          }
        });
        
        // Make text file public
        await textBlob.makePublic();

        // Upload original PDF to Cloud Storage
        const pdfBlob = bucket.file(pdfFileName);
        const fileContent = fs.readFileSync(file.filepath);

        await pdfBlob.save(fileContent, {
          metadata: {
            contentType: 'application/pdf',
            metadata: {
              originalName: file.originalFilename || file.name,
              uploadedAt: new Date().toISOString()
            }
          }
        });
        
        // Make PDF file public
        await pdfBlob.makePublic();

        // Clean up temp file
        fs.unlinkSync(file.filepath);

        // Get public URLs
        const textUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET}/${textFileName}`;
        const pdfUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET}/${pdfFileName}`;

        // Return results
        return res.status(200).json({
          success: true,
          documentUrl: textUrl,
          originalPdfUrl: pdfUrl, // NOVÉ - URL původního PDF
          fileName: textFileName,
          pageCount: document.pages ? document.pages.length : 0,
          preview: document.text ? document.text.substring(0, 200) + '...' : '',
          originalName: file.originalFilename || file.name
        });

      } catch (processError) {
        console.error('Document AI error:', processError);
        return res.status(500).json({ 
          error: 'Failed to process document',
          message: processError.message 
        });
      }
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}