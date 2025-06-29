// 🎙️ api/whisper.js - UTF-8 FIXED VERSION
// ✅ FIX: Přidány UTF-8 headers pro opravu diakritiky v transcripci

import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // ✅ KRITICKÝ FIX: UTF-8 headers MUSÍ být na začátku!
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎙️ Whisper API called');
    console.log('🔤 Request Content-Type:', req.headers['content-type']);
    console.log('📤 Response Content-Type:', res.getHeader('Content-Type'));

    let audioBuffer;

    // Handle different content types
    if (req.headers['content-type'] === 'application/octet-stream') {
      // Direct binary upload
      const chunks = [];
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      await new Promise((resolve, reject) => {
        req.on('end', resolve);
        req.on('error', reject);
      });
      
      audioBuffer = Buffer.concat(chunks);
    } else {
      // Form data upload
      const form = formidable({
        maxFileSize: 25 * 1024 * 1024, // 25MB limit
        keepExtensions: true,
      });

      const [fields, files] = await form.parse(req);
      const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

      if (!audioFile) {
        return res.status(400).json({ 
          success: false, 
          error: 'No audio file provided' 
        });
      }

      audioBuffer = fs.readFileSync(audioFile.filepath);
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Empty audio buffer' 
      });
    }

    console.log('📊 Audio buffer size:', audioBuffer.length);

    // ✅ WHISPER API CALL s UTF-8:
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'auto');  // Let Whisper detect language
    formData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        // ✅ NO Content-Type for FormData - let browser set it
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Whisper API Error:', response.status, errorData);
      
      // ✅ ERROR s UTF-8:
      return res.status(response.status).json({ 
        success: false,
        error: `Whisper API Error: ${response.status}`,
        details: errorData 
      });
    }

    const data = await response.json();

    // ✅ DEBUGGING UTF-8 OUTPUT:
    console.log('📝 Whisper raw response:', data);
    
    if (data.text) {
      console.log('🗣️ Transcribed text:', data.text);
      console.log('🌍 Detected language:', data.language || 'unknown');
      
      // Test if Czech/Romanian characters are preserved
      const hasCzechChars = /[áčďéěíňóřšťúůýž]/i.test(data.text);
      const hasRomanianChars = /[ăâîșțĂÂÎȘȚ]/i.test(data.text);
      
      if (hasCzechChars) {
        console.log('✅ Czech diacritics preserved in transcription');
        console.log('🔤 Czech chars found:', data.text.match(/[áčďéěíňóřšťúůýž]/gi));
      }
      
      if (hasRomanianChars) {
        console.log('✅ Romanian diacritics preserved in transcription');
        console.log('🔤 Romanian chars found:', data.text.match(/[ăâîșțĂÂÎȘȚ]/gi));
      }
    }

    // ✅ SUCCESS RESPONSE s UTF-8:
    return res.status(200).json({
      success: true,
      text: data.text || '',
      language: data.language || 'unknown',
      confidence: 1.0,  // Whisper doesn't provide confidence, default to 1.0
      duration: data.duration || null
    });

  } catch (error) {
    console.error('💥 Whisper API Error:', error);
    
    // ✅ ENSURE UTF-8 for error responses:
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}