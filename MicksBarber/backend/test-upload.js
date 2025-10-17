const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Test file upload endpoint
async function testUpload() {
  try {
    console.log('🧪 Testing file upload endpoint...');
    
    // Create a test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Create form data
    const formData = new FormData();
    formData.append('receipt', testImageBuffer, {
      filename: 'test-receipt.png',
      contentType: 'image/png'
    });
    
    console.log('Sending upload request...');
    
    const response = await axios.post('http://localhost:3000/api/upload/receipt', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 10000,
    });
    
    console.log('✅ Upload successful!');
    console.log('Response:', response.data);
    
    // Test getting the uploaded file
    if (response.data.success) {
      const filename = response.data.data.filename;
      console.log('Testing file retrieval...');
      
      const fileResponse = await axios.get(`http://localhost:3000/api/upload/receipt/${filename}`);
      console.log('✅ File retrieval successful!');
      console.log('File size:', fileResponse.data.length, 'bytes');
    }
    
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testUpload();
