param(
  [switch]$SkipCreateUsers,
  [switch]$SkipRotationChecks,
  [switch]$SkipK6,
  [switch]$SkipCleanup,
  [string]$ResultsRoot = "load-tests/results"
)

$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Invoke-Step {
  param(
    [string]$Name,
    [string]$Command,
    [string]$LogFile
  )

  Write-Step $Name
  Write-Host $Command -ForegroundColor DarkGray

  $output = cmd /c "$Command 2>&1"
  $output | Tee-Object -FilePath $LogFile | Out-Host

  if ($LASTEXITCODE -ne 0) {
    throw "Step failed: $Name (exit $LASTEXITCODE). See log: $LogFile"
  }
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $projectRoot

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$runDir = Join-Path $projectRoot (Join-Path $ResultsRoot $timestamp)
New-Item -ItemType Directory -Path $runDir -Force | Out-Null

Write-Host "Project root: $projectRoot"
Write-Host "Results dir : $runDir"

if (-not $env:ADMIN_TOKEN -or [string]::IsNullOrWhiteSpace($env:ADMIN_TOKEN)) {
  Write-Step "Generate ADMIN token"
  $generatedToken = node scripts/load-testing/generate-admin-token.js
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($generatedToken)) {
    throw "Could not generate ADMIN_TOKEN automatically. Set ADMIN_TOKEN manually and retry."
  }
  $env:ADMIN_TOKEN = $generatedToken.Trim()
  Write-Host "ADMIN token generated automatically." -ForegroundColor Green
}

if (-not $SkipCreateUsers) {
  Invoke-Step -Name "Create test users" -Command "node scripts/load-testing/create-test-users.js" -LogFile (Join-Path $runDir "01-create-users.log")
}

if (-not $SkipRotationChecks) {
  Invoke-Step -Name "DB rotation check" -Command "node scripts/load-testing/test-db-rotation.js" -LogFile (Join-Path $runDir "02-db-rotation.log")
  Invoke-Step -Name "Cloudinary rotation check" -Command "node scripts/load-testing/test-cloudinary.js" -LogFile (Join-Path $runDir "03-cloudinary-rotation.log")
}

if (-not $SkipK6) {
  $k6Path = $null
  $k6Cmd = Get-Command k6 -ErrorAction SilentlyContinue
  if ($k6Cmd) {
    $k6Path = $k6Cmd.Source
  } else {
    $candidate = "C:\Program Files\k6\k6.exe"
    if (Test-Path $candidate) {
      $k6Path = $candidate
    } else {
      throw "k6 executable not found. Install k6 or add it to PATH."
    }
  }

  Invoke-Step -Name "k6 main load test" -Command "`"$k6Path`" run --summary-export `"$runDir\main-summary.json`" load-tests/main-load-test.js" -LogFile (Join-Path $runDir "04-k6-main.log")
  Invoke-Step -Name "k6 feature matrix load test" -Command "`"$k6Path`" run --summary-export `"$runDir\matrix-summary.json`" load-tests/feature-matrix-load-test.js" -LogFile (Join-Path $runDir "05-k6-matrix.log")
}

if (-not $SkipCleanup) {
  Invoke-Step -Name "Cleanup test users" -Command "node scripts/load-testing/cleanup-test-users.js" -LogFile (Join-Path $runDir "06-cleanup-users.log")
}

Write-Host "`nLoad test run complete." -ForegroundColor Green
Write-Host "All logs and k6 summaries saved to: $runDir" -ForegroundColor Green
