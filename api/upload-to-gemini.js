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
  console.log('🔍 Received pdfUrl:', pdfUrl);

  if (!pdfUrl) {
    return res.status(400).json({ error: 'PDF URL is required' });
  }

  try {
    // Extrahuj název souboru z URL
    // Z: https://storage.googleapis.com/omnia-temp-docs/documents/pdf/xxx.pdf
    // Na: gs://omnia-temp-docs/documents/pdf/xxx.pdf
    
    const urlParts = pdfUrl.split('?')[0]; // Odstranit query parametry
    const pathMatch = urlParts.match(/storage\.googleapis\.com\/([^\/]+)\/(.+)$/);
    
    if (!pathMatch) {
      throw new Error('Invalid Cloud Storage URL format');
    }
    
    const bucket = pathMatch[1];
    const filePath = pathMatch[2];
    const gcsUri = `gs://${bucket}/${filePath}`;
    
    console.log('Vertex AI will use Cloud Storage file:', gcsUri);
    console.log('🎯 Returning gcsUri:', gcsUri);

    // Vertex AI může číst přímo z Cloud Storage!
    // Nemusíme nic uploadovat
    
    return res.status(200).json({
      success: true,
      fileUri: gcsUri, // gs:// format pro Vertex AI
      fileName: originalName
    });

  } catch (error) {
    console.error('Cloud Storage URI error:', error);
    return res.status(500).json({ 
      error: 'Failed to process Cloud Storage URI',
      message: error.message 
    });
  }
}