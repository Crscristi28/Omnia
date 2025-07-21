import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { IncomingForm } from 'formidable';
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

        const projectId = credentials.project_id;
        const location = process.env.DOCUMENT_AI_LOCATION;
        const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

        // Construct processor path
        const name = client.processorPath(projectId, location, processorId);
        
        // Read file content
        const fileContent = fs.readFileSync(file.filepath);
        
        // Create request
        const request = {
          name: name,
          rawDocument: {
            content: fileContent.toString('base64'),
            mimeType: 'application/pdf',
          },
        };

        // Process document
        const [result] = await client.processDocument(request);
        const { document } = result;

        // Clean up temp file
        fs.unlinkSync(file.filepath);

        // Return results
        return res.status(200).json({
          success: true,
          fullText: document.text || '',
          pageCount: document.pages ? document.pages.length : 0,
          preview: document.text ? document.text.substring(0, 200) + '...' : ''
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