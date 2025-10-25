import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © 2024 by Jose Adrianne Hinaut
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#DC2626', // Red background
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#FFFFFF', // White font
    fontSize: 12,
    fontWeight: '500',
  },
});
