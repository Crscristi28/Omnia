import { GoogleAIFileManager } from "@google/generative-ai/server";
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pdfUrl, originalName } = req.body;

  if (!pdfUrl) {
    return res.status(400).json({ error: 'PDF URL is required' });
  }

  try {
    // Initialize Gemini File Manager
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    // Download PDF from Cloud Storage
    console.log('Downloading PDF from Cloud Storage:', pdfUrl);
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save temporarily
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${Date.now()}-${originalName}`);
    fs.writeFileSync(tempFilePath, buffer);

    // Upload to Gemini File API
    console.log('Uploading to Gemini File API...');
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: 'application/pdf',
      displayName: originalName,
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    console.log('File uploaded to Gemini:', uploadResult.file.uri);

    return res.status(200).json({
      success: true,
      fileUri: uploadResult.file.uri,
      fileName: originalName
    });

  } catch (error) {
    console.error('Gemini File API error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload to Gemini',
      message: error.message 
    });
  }
}