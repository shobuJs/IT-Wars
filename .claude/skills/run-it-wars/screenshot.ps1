# Headless screenshot of any game screen via Edge (present on every Win10/11).
# Usage (from repo root, with serve.mjs already running):
#   powershell -File .claude\skills\run-it-wars\screenshot.ps1 -Url "http://localhost:8321/index.html?screen=characterSelect" -Out shot.png
param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$Out,
  [int]$BudgetMs = 3000
)
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
if (-not (Test-Path $edge)) { Write-Error "Edge not found"; exit 1 }
$OutFull = [System.IO.Path]::GetFullPath($Out)
& $edge --headless=new --disable-gpu --window-size=1280,760 --virtual-time-budget=$BudgetMs --screenshot="$OutFull" $Url 2>$null | Out-Null
if (Test-Path $OutFull) { Write-Output "screenshot: $OutFull" } else { Write-Error "screenshot failed"; exit 1 }
