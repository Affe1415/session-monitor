param(
  [string]$Source = "build/source-icon.ico",
  [string]$Output = "build/icon.ico"
)

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $root $Source
$outputPath = Join-Path $root $Output
$buildDir = Split-Path -Parent $outputPath
$iconsDir = Join-Path $buildDir "icons"

New-Item -ItemType Directory -Force -Path $buildDir | Out-Null
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

if (!(Test-Path -LiteralPath $sourcePath)) {
  throw "Source icon not found: $sourcePath"
}

function New-ResizedBitmap {
  param(
    [System.Drawing.Bitmap]$SourceBitmap,
    [int]$Size
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

  $scale = [Math]::Min($Size / $SourceBitmap.Width, $Size / $SourceBitmap.Height)
  $width = [Math]::Round($SourceBitmap.Width * $scale)
  $height = [Math]::Round($SourceBitmap.Height * $scale)
  $x = [Math]::Round(($Size - $width) / 2)
  $y = [Math]::Round(($Size - $height) / 2)

  $graphics.DrawImage($SourceBitmap, $x, $y, $width, $height)
  $graphics.Dispose()

  return $bitmap
}

$sourceIcon = $null
$sourceImage = $null
$extension = [System.IO.Path]::GetExtension($sourcePath).ToLowerInvariant()

if ($extension -eq ".ico") {
  try {
    $sourceIcon = New-Object System.Drawing.Icon $sourcePath
    $sourceImage = $sourceIcon.ToBitmap()
  } catch {
    throw "Could not read ICO source. Use a PNG source instead. Original error: $($_.Exception.Message)"
  }
} else {
  $sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
}

$sourceBitmap = New-Object System.Drawing.Bitmap $sourceImage
$sourceImage.Dispose()
if ($sourceIcon -ne $null) {
  $sourceIcon.Dispose()
}
$sizes = @(16, 24, 32, 48, 64, 128, 256)
$pngEntries = @()

foreach ($size in $sizes) {
  $bitmap = New-ResizedBitmap -SourceBitmap $sourceBitmap -Size $size
  $pngPath = Join-Path $iconsDir "icon-$size.png"
  $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

  if ($size -eq 256) {
    $bitmap.Save((Join-Path $buildDir "icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }

  $pngEntries += [PSCustomObject]@{
    Size = $size
    Bytes = [System.IO.File]::ReadAllBytes($pngPath)
  }

  $bitmap.Dispose()
}

$stream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter $stream

$writer.Write([UInt16]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]$pngEntries.Count)

$offset = 6 + (16 * $pngEntries.Count)
foreach ($entry in $pngEntries) {
  $dimension = if ($entry.Size -eq 256) { 0 } else { $entry.Size }
  $writer.Write([Byte]$dimension)
  $writer.Write([Byte]$dimension)
  $writer.Write([Byte]0)
  $writer.Write([Byte]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]32)
  $writer.Write([UInt32]$entry.Bytes.Length)
  $writer.Write([UInt32]$offset)
  $offset += $entry.Bytes.Length
}

foreach ($entry in $pngEntries) {
  $writer.Write($entry.Bytes)
}

$writer.Flush()
[System.IO.File]::WriteAllBytes($outputPath, $stream.ToArray())

$writer.Dispose()
$stream.Dispose()
$sourceBitmap.Dispose()

Write-Host "Generated $Output from $Source with 256x256 installer support."
