# Start Backend Server
$env:PATH = "C:\Program Files\nodejs;C:\Program Files\PostgreSQL\18\bin;" + $env:PATH
Set-Location "C:\Users\FadichPRV\Desktop\jnen APP\smart-house-manager\backend"
Write-Host "Starting backend on http://localhost:5000 ..." -ForegroundColor Cyan
node server.js
