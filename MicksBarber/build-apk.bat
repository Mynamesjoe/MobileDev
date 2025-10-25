@echo off
echo Building Mick's Barber APK...
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building APK with EAS...
echo Note: This will use Expo's cloud build service
echo.

echo Choose build type:
echo 1. Development build (for testing)
echo 2. Preview build (APK for distribution)
echo 3. Production build (signed APK)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Building development APK...
    eas build --platform android --profile development
) else if "%choice%"=="2" (
    echo Building preview APK...
    eas build --platform android --profile preview
) else if "%choice%"=="3" (
    echo Building production APK...
    eas build --platform android --profile production
) else (
    echo Invalid choice. Building preview APK...
    eas build --platform android --profile preview
)

echo.
echo Build process started! Check your Expo dashboard for progress.
echo The APK will be available for download once the build completes.
pause
