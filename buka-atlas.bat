@echo off
title Membuka ATLAS Search...
cd /d "%~dp0"
echo ==================================================
echo   Membuka ATLAS Search Beyond Keywords...
echo ==================================================
node scripts/serve.js
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [PERINGATAN] Node.js tidak terdeteksi atau terjadi kesalahan.
  echo Silakan pastikan Node.js telah terpasang dari https://nodejs.org
  echo.
  pause
)
