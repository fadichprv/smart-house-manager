# Start Frontend Server
$env:PATH = "C:\Program Files\nodejs;C:\Program Files\PostgreSQL\18\bin;" + $env:PATH
Set-Location "C:\Users\FadichPRV\Desktop\jnen APP\smart-house-manager\frontend"
Write-Host "Starting frontend on http://localhost:3000 ..." -ForegroundColor Cyan
npx next dev
