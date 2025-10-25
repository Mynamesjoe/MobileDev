# Mick's Barber EAS Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Mick's Barber EAS Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setting up EAS build for Mick's Barber app..." -ForegroundColor Green
Write-Host ""

# Check if EAS CLI is installed
try {
    $easVersion = eas --version
    Write-Host "EAS CLI found: $easVersion" -ForegroundColor Green
} catch {
    Write-Host "EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g eas-cli
}

Write-Host ""
Write-Host "Initializing EAS project..." -ForegroundColor Green

# Create a simple input file for non-interactive mode
$inputFile = "eas-input.txt"
"y" | Out-File -FilePath $inputFile -Encoding ASCII

try {
    # Try to initialize EAS
    Get-Content $inputFile | eas init
    Write-Host "EAS project initialized successfully!" -ForegroundColor Green
} catch {
    Write-Host "EAS initialization failed. You may need to run this manually." -ForegroundColor Red
    Write-Host "Run: eas init" -ForegroundColor Yellow
}

# Clean up
Remove-Item $inputFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: eas build --platform android --profile preview" -ForegroundColor White
Write-Host "2. Check your build progress at: https://expo.dev" -ForegroundColor White
Write-Host "3. Download APK when build completes" -ForegroundColor White
Write-Host ""

Write-Host "Your app configuration:" -ForegroundColor Cyan
Write-Host "- Package: com.micksbarber.app" -ForegroundColor White
Write-Host "- Backend: https://micksbarber.ccshub.uk" -ForegroundColor White
Write-Host "- Version: 1.0.0" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
