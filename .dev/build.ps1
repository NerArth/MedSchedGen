# Load configuration from package.json
$packageJson = Get-Content -Raw -Path "package.json" | ConvertFrom-Json
$config = $packageJson.build
$version = $packageJson.version

# Determine paths
$htmlPath = Join-Path (Get-Location) $config.source.html
$cssPath = Join-Path (Get-Location) $config.source.css
$jsPath = Join-Path (Get-Location) $config.source.js

# Read contents
$htmlContent = Get-Content -Raw -Path $htmlPath
$cssContent = Get-Content -Raw -Path $cssPath
$jsContent = Get-Content -Raw -Path $jsPath

# Inject CSS (Replace the <link> tag with <style> blocks)
# We use regex to find the link tag. Matches: <link rel="stylesheet" href="style.css" />
$styleTag = "<style>`n$cssContent`n</style>"
$htmlContent = $htmlContent -replace '<link rel="stylesheet" href="style\.css"\s*/?>', $styleTag

# Inject JS (Replace the <script> tag with <script> blocks)
# Matches: <script src="script.js"></script>
$scriptTag = "<script>`n$jsContent`n</script>"
$htmlContent = $htmlContent -replace '<script src="script\.js"></script>', $scriptTag

# Prepare output
$outDir = Join-Path (Get-Location) $config.output.directory
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$outFileName = $config.output.nameFormat -replace '\{version\}', $version
$outPath = Join-Path $outDir $outFileName

# Write output file
$htmlContent | Set-Content -Path $outPath -Encoding UTF8

Write-Host "Build successful: $outPath" -ForegroundColor Green
