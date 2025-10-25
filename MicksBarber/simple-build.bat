@echo off
echo ========================================
echo    Mick's Barber APK Builder
echo ========================================
echo.

echo This script will help you build an APK for your Mick's Barber app.
echo.

echo Choose your build method:
echo.
echo 1. EAS Build (Cloud-based, Recommended)
echo    - No local setup required
echo    - Builds in the cloud
echo    - Download APK when ready
echo.
echo 2. Local Build (Requires Android Studio)
echo    - Builds on your computer
echo    - Requires Android SDK setup
echo.

set /p method="Enter your choice (1 or 2): "

if "%method%"=="1" goto eas_build
if "%method%"=="2" goto local_build
echo Invalid choice. Using EAS Build...
goto eas_build

:eas_build
echo.
echo ========================================
echo    EAS Build (Cloud-based)
echo ========================================
echo.
echo Setting up EAS build...
echo.

echo Installing dependencies...
call npm install

echo.
echo Starting EAS build...
echo This will build your app in the cloud.
echo You'll get a download link when it's ready.
echo.

eas build --platform android --profile preview

echo.
echo Build started! Check your progress at:
echo https://expo.dev/accounts/mynamesjoe/projects/MicksBarber
echo.
goto end

:local_build
echo.
echo ========================================
echo    Local Build Setup
echo ========================================
echo.
echo For local builds, you need Android Studio installed.
echo.
echo 1. Download Android Studio from:
echo    https://developer.android.com/studio
echo.
echo 2. Install Android Studio with default settings
echo.
echo 3. Set ANDROID_HOME environment variable:
echo    ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
echo.
echo 4. Restart your command prompt
echo.
echo 5. Run this command to build:
echo    cd android && gradlew assembleDebug
echo.
echo The APK will be created at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
goto end

:end
echo.
echo ========================================
echo    Build Process Complete
echo ========================================
echo.
echo Your Mick's Barber app is configured with:
echo - Package: com.micksbarber.app
echo - Backend: https://micksbarber.ccshub.uk
echo - Version: 1.0.0
echo.
pause
