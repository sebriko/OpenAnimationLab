@echo off
echo Starting GuiFunctions Builder...
node build-gui-functions.js
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo Build completed successfully!
pause