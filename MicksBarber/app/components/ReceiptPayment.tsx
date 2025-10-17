import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { paymentAPI, paymentUtils } from '../../services/paymentAPI';
import { uploadAPI } from '../../services/uploadAPI';

interface ReceiptPaymentProps {
  userId: number;
  amount: number;
  appointmentId: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

export default function ReceiptPayment({ 
  userId, 
  amount, 
  appointmentId, 
  onPaymentSuccess, 
  onPaymentError 
}: ReceiptPaymentProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadReceipt = async (imageUri: string) => {
    try {
      setIsUploading(true);
      console.log('Starting receipt upload:', imageUri);
      
      // Use the upload API service
      const receiptUrl = await uploadAPI.uploadReceipt(imageUri);
      console.log('Upload successful:', receiptUrl);
      
      return receiptUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please upload a receipt image');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Starting payment process...');
      
      // Upload receipt
      console.log('Step 1: Uploading receipt...');
      const receiptUrl = await uploadReceipt(selectedImage);
      console.log('Receipt uploaded successfully:', receiptUrl);
      
      // Create payment with receipt
      console.log('Step 2: Creating payment record...');
      const paymentData = {
        appointment_id: appointmentId,
        user_id: userId,
        amount: amount,
        payment_method: 'gcash' as const, // Default to GCash for receipt uploads
        transaction_id: paymentUtils.generateTransactionId(),
        payment_reference: `REF_${Date.now()}`,
        receipt_image: receiptUrl
      };

      console.log('Payment data:', paymentData);
      const createdPayment = await paymentAPI.createPayment(paymentData);
      console.log('Payment created successfully:', createdPayment);
      
      onPaymentSuccess({
        ...createdPayment,
        receipt_image: receiptUrl,
        payment_status: 'pending'
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment processing failed. Please try again.';
      if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Upload')) {
        errorMessage = 'Failed to upload receipt. Please try again.';
      }
      
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Upload Receipt',
      'Choose how you want to upload your payment receipt:',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Receipt Upload</Text>
      <Text style={styles.amount}>Amount: {paymentUtils.formatCurrency(amount)}</Text>
      <Text style={styles.instructions}>
        Please upload a clear photo of your payment receipt for verification.
      </Text>

      <View style={styles.imageContainer}>
        {selectedImage ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <TouchableOpacity 
              style={styles.changeImageButton} 
              onPress={showImageOptions}
            >
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={showImageOptions}>
            <Text style={styles.uploadButtonText}>📷 Upload Receipt</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentInfoTitle}>Payment Information:</Text>
        <Text style={styles.paymentInfoText}>• Upload a clear photo of your payment receipt</Text>
        <Text style={styles.paymentInfoText}>• Admin will verify your payment within 24 hours</Text>
        <Text style={styles.paymentInfoText}>• You'll receive a notification once verified</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.payButton, 
          (!selectedImage || isProcessing || isUploading) && styles.disabledButton
        ]}
        onPress={handlePayment}
        disabled={!selectedImage || isProcessing || isUploading}
      >
        {isProcessing || isUploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.payButtonText}>
            Submit Payment Receipt
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  changeImageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  changeImageText: {
    color: 'white',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#F0F0F0',
    padding: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#666',
  },
  paymentInfo: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  paymentInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
