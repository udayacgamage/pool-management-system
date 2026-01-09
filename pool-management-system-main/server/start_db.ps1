$mongodPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$dataDir = Join-Path $PSScriptRoot "data"

if (!(Test-Path $dataDir)) {
    New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
    Write-Host "Created data directory at $dataDir" -ForegroundColor Green
}

try {
    Write-Host "Starting MongoDB from $mongodPath..." -ForegroundColor Cyan
    Write-Host "Data directory: $dataDir" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
    
    & $mongodPath --dbpath $dataDir
}
catch {
    Write-Host "Error starting MongoDB: $_" -ForegroundColor Red
}
finally {
    Write-Host "Server process ended." -ForegroundColor Gray
    Read-Host "Press Enter to exit..."
}
