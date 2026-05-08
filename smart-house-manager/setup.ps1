# Smart House Manager - Setup Script
$env:PATH = "C:\Program Files\nodejs;C:\Program Files\PostgreSQL\18\bin;" + $env:PATH

Write-Host "`n=== Smart House Manager Setup ===" -ForegroundColor Cyan

# 1. Install backend dependencies
Write-Host "`n[1/3] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "C:\Users\FadichPRV\Desktop\jnen APP\smart-house-manager\backend"
npm install --prefer-offline
Write-Host "Backend dependencies installed." -ForegroundColor Green

# 2. Install frontend dependencies
Write-Host "`n[2/3] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "C:\Users\FadichPRV\Desktop\jnen APP\smart-house-manager\frontend"
npm install --prefer-offline
Write-Host "Frontend dependencies installed." -ForegroundColor Green

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Now run: .\start-backend.ps1  and  .\start-frontend.ps1" -ForegroundColor White
