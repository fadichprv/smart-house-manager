# Smart House Manager - Database Setup Script
$env:PATH = "C:\Program Files\nodejs;C:\Program Files\PostgreSQL\18\bin;" + $env:PATH

Write-Host "`n=== Database Setup ===" -ForegroundColor Cyan
Write-Host "Enter your PostgreSQL password (set during installation):" -ForegroundColor Yellow
$pgPass = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPass)
$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
$env:PGPASSWORD = $plainPass

Write-Host "`n[1/3] Creating database..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE smart_house_db;" 2>&1
Write-Host "Done." -ForegroundColor Green

Write-Host "`n[2/3] Running schema..." -ForegroundColor Yellow
psql -U postgres -d smart_house_db -f "C:\Users\FadichPRV\Desktop\jnen APP\smart-house-manager\backend\database\schema.sql" 2>&1
Write-Host "Done." -ForegroundColor Green

Write-Host "`n[3/3] Running seed data..." -ForegroundColor Yellow
psql -U postgres -d smart_house_db -f "C:\Users\FadichPRV\Desktop\jnen APP\smart-house-manager\backend\database\seed.sql" 2>&1
Write-Host "Done." -ForegroundColor Green

# Create .env file
Write-Host "`n[4/4] Creating backend .env file..." -ForegroundColor Yellow
$envContent = @"
PORT=5000
DATABASE_URL=postgresql://postgres:$plainPass@localhost:5432/smart_house_db
JWT_SECRET=smarthouse_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
"@
Set-Content -Path "C:\Users\FadichPRV\Desktop\jnen APP\smart-house-manager\backend\.env" -Value $envContent
Write-Host ".env file created." -ForegroundColor Green

Write-Host "`n=== Database Setup Complete ===" -ForegroundColor Cyan
