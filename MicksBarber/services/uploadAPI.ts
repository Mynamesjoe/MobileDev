import Constants from 'expo-constants';

// Resolve base URL that works on device (Expo Go) and emulator
function resolveBaseUrl(): string {
  // Default to localhost (works on web/emulator)
  let host = 'localhost';

  // Try to infer LAN IP from Expo (works on Expo Go on device)
  const hostUri = (Constants as any)?.expoConfig?.hostUri;
  if (hostUri) {
    // Extract IP from hostUri (format: "192.168.1.100:8081")
    const parts = hostUri.split(':');
    if (parts.length >= 1) {
      host = parts[0];
    }
  }

  return `http://${host}:3000/api`;
}

const API_BASE_URL = resolveBaseUrl();

// Upload API service with proper React Native FormData handling
export const uploadAPI = {
  // Upload receipt image
  uploadReceipt: async (imageUri: string) => {
    try {
      console.log('Uploading receipt:', imageUri);
      console.log('API URL:', `${API_BASE_URL}/upload/receipt`);
      
      // Create FormData for React Native
      const formData = new FormData();
      
      // React Native FormData format
      formData.append('receipt', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      console.log('FormData created, sending request...');

      // Use fetch with proper React Native FormData handling
      const response = await fetch(`${API_BASE_URL}/upload/receipt`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - let fetch handle it automatically
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.success) {
        return result.data.url;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.message.includes('Network request failed')) {
        throw new Error('Network error - please check your connection and try again');
      }
      throw new Error(error.message || 'Upload failed');
    }
  },

  // Get receipt image URL
  getReceiptUrl: (filename: string) => {
    return `${API_BASE_URL.replace('/api', '')}/uploads/receipts/${filename}`;
  }
};
