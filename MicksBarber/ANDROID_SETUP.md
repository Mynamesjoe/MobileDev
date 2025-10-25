# Android APK Build Setup Guide

## 🚀 **Quick Start - EAS Build (Recommended)**

The easiest way to build your APK is using Expo's cloud build service:

### **Step 1: Run the build script**
```bash
# Double-click build-apk.bat or run:
build-apk.bat
```

### **Step 2: Choose build type**
- **Development**: For testing (requires Expo Go)
- **Preview**: APK file for distribution
- **Production**: Signed APK for Play Store

### **Step 3: Download APK**
- Check your Expo dashboard at https://expo.dev
- Download the APK when build completes

---

## 🔧 **Manual Setup - Local Build**

If you prefer to build locally, you'll need Android Studio:

### **Step 1: Install Android Studio**
1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and install SDK components

### **Step 2: Set Environment Variables**
Add to your system environment variables:
```
ANDROID_HOME=C:\Users\[YourUsername]\AppData\Local\Android\Sdk
```

### **Step 3: Build APK**
```bash
cd android
.\gradlew assembleDebug
```

The APK will be created at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 **Current App Configuration**

Your app is configured with:
- **Package**: `com.micksbarber.app`
- **Version**: 1.0.0
- **Permissions**: Camera, Storage access
- **Backend**: https://micksbarber.ccshub.uk

---

## 🎯 **Recommended Approach**

**Use EAS Build** - it's the easiest and most reliable method:
1. Run `build-apk.bat`
2. Choose "Preview build"
3. Wait for build to complete
4. Download APK from Expo dashboard

This method doesn't require any local Android setup!
