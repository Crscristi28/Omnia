import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';

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
    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'Missing required fields: fileName, fileType' });
    }

    // Check file size (optional - you can set your own limits)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB` 
      });
    }

    // Initialize Cloud Storage
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const storage = new Storage({
      credentials: credentials,
      projectId: credentials.project_id
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const fileExtension = fileName.split('.').pop() || 'bin';
    const uniqueFileName = `documents/uploads/${timestamp}-${randomId}.${fileExtension}`;

    // Get bucket
    const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET);
    const file = bucket.file(uniqueFileName);

    // Normalize content type for better compatibility
    const normalizedContentType = fileType || 'application/octet-stream';
    
    console.log(`📝 [GET-UPLOAD-URL] Generating signed URL for ${fileName} (${normalizedContentType})`);
    
    // Generate signed URL for upload
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: normalizedContentType,
      extensionHeaders: {
        'x-goog-content-length-range': `0,${MAX_FILE_SIZE}`,
      },
    });

    // Generate signed URL for reading (after upload)
    const [downloadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    // Return both URLs
    return res.status(200).json({
      success: true,
      uploadUrl,
      downloadUrl,
      fileName: uniqueFileName,
      originalName: fileName,
      gcsUri: `gs://${process.env.GOOGLE_STORAGE_BUCKET}/${uniqueFileName}`,
      publicUrl: `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET}/${uniqueFileName}`
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ 
      error: 'Failed to generate upload URL',
      message: error.message 
    });
  }
}