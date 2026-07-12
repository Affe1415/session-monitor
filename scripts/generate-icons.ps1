Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $root "build"
$iconsDir = Join-Path $buildDir "icons"
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

function New-SessionMonitorBitmap {
  param([int]$Size)

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

  $radius = [Math]::Round($Size * 0.22)
  $rect = New-Object System.Drawing.RectangleF 0, 0, $Size, $Size
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect,
    ([System.Drawing.Color]::FromArgb(255, 76, 85, 255)),
    ([System.Drawing.Color]::FromArgb(255, 46, 204, 113)),
    135
  $graphics.FillPath($background, $path)

  $innerMargin = $Size * 0.22
  $inner = New-Object System.Drawing.RectangleF $innerMargin, $innerMargin, ($Size - ($innerMargin * 2)), ($Size - ($innerMargin * 2))
  $penWidth = [Math]::Max(2, [Math]::Round($Size * 0.055))
  $whitePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(235, 255, 255, 255)), $penWidth
  $graphics.DrawEllipse($whitePen, $inner)

  $linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 255, 255, 255)), ([Math]::Max(1, [Math]::Round($Size * 0.035)))
  $graphics.DrawLine($linePen, ($Size * 0.5), ($Size * 0.25), ($Size * 0.5), ($Size * 0.75))
  $graphics.DrawLine($linePen, ($Size * 0.25), ($Size * 0.5), ($Size * 0.75), ($Size * 0.5))

  $dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 14, 17, 23))
  $dotSize = $Size * 0.16
  $graphics.FillEllipse($dotBrush, (($Size - $dotSize) / 2), (($Size - $dotSize) / 2), $dotSize, $dotSize)

  $graphics.Dispose()
  $background.Dispose()
  $whitePen.Dispose()
  $linePen.Dispose()
  $dotBrush.Dispose()
  $path.Dispose()

  return $bitmap
}

function Save-PngBytes {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

$sizes = @(16, 24, 32, 48, 64, 128, 256)
$pngEntries = @()

foreach ($size in $sizes) {
  $bitmap = New-SessionMonitorBitmap -Size $size
  $path = Join-Path $iconsDir "icon-$size.png"
  Save-PngBytes -Bitmap $bitmap -Path $path
  $pngEntries += [PSCustomObject]@{
    Size = $size
    Bytes = [System.IO.File]::ReadAllBytes($path)
  }
  if ($size -eq 256) {
    Save-PngBytes -Bitmap $bitmap -Path (Join-Path $buildDir "icon.png")
  }
  $bitmap.Dispose()
}

$icoPath = Join-Path $buildDir "icon.ico"
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
[System.IO.File]::WriteAllBytes($icoPath, $stream.ToArray())
$writer.Dispose()
$stream.Dispose()

Write-Host "Generated build/icon.ico, build/icon.png and PNG sizes in build/icons"
