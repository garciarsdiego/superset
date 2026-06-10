param(
  [int]$Samples = 12,
  [int]$IntervalSeconds = 5,
  [string]$OutDir = "$env:USERPROFILE\Desktop\superset-performance-samples"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$csvPath = Join-Path $OutDir "superset-process-samples-$timestamp.csv"
$summaryPath = Join-Path $OutDir "superset-process-summary-$timestamp.md"

function Get-SupersetRole {
  param([object]$Process)

  $name = [string]$Process.Name
  $commandLine = [string]$Process.CommandLine

  if ($commandLine -match "host-service") { return "host-service" }
  if ($commandLine -match "terminal-host") { return "terminal-host" }
  if ($commandLine -match "pty-daemon") { return "pty-daemon" }
  if ($commandLine -match "--type=renderer") { return "renderer" }
  if ($commandLine -match "--type=gpu-process") { return "gpu" }
  if ($commandLine -match "--type=utility") { return "utility" }
  if ($commandLine -match "--type=") { return "electron-helper" }
  if ($name -match "Superset|Electron") { return "main-or-packaged" }
  if ($name -match "node|bun") { return "node-helper" }
  return "related"
}

function Get-SupersetProcesses {
  $all = Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -match "Superset|Electron|node|bun|conhost|OpenConsole" -or
      $_.CommandLine -match "superset|host-service|terminal-host|pty-daemon"
    }

  $supersetPids = New-Object System.Collections.Generic.HashSet[int]
  foreach ($process in $all) {
    if ($process.Name -match "Superset|Electron" -or $process.CommandLine -match "superset|host-service|terminal-host|pty-daemon") {
      [void]$supersetPids.Add([int]$process.ProcessId)
    }
  }

  $changed = $true
  while ($changed) {
    $changed = $false
    foreach ($process in $all) {
      if ($supersetPids.Contains([int]$process.ParentProcessId) -and -not $supersetPids.Contains([int]$process.ProcessId)) {
        [void]$supersetPids.Add([int]$process.ProcessId)
        $changed = $true
      }
    }
  }

  $all | Where-Object { $supersetPids.Contains([int]$_.ProcessId) }
}

$rows = @()
for ($i = 1; $i -le $Samples; $i++) {
  $sampleTime = Get-Date
  $processes = Get-SupersetProcesses

  foreach ($process in $processes) {
    $rows += [pscustomobject]@{
      sample = $i
      timestamp = $sampleTime.ToString("o")
      role = Get-SupersetRole $process
      pid = $process.ProcessId
      ppid = $process.ParentProcessId
      name = $process.Name
      workingSetMB = [math]::Round(($process.WorkingSetSize / 1MB), 1)
      commandLinePreview = ([string]$process.CommandLine) -replace "(?i)(token|secret|password|key|authorization)=([^ `"`"]+)", '$1=[REDACTED]'
    }
  }

  if ($i -lt $Samples) {
    Start-Sleep -Seconds $IntervalSeconds
  }
}

$rows | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $csvPath

$byRole = $rows |
  Group-Object role |
  Sort-Object Name |
  ForEach-Object {
    $maxMb = ($_.Group | Measure-Object workingSetMB -Maximum).Maximum
    $avgMb = ($_.Group | Measure-Object workingSetMB -Average).Average
    "| $($_.Name) | $($_.Count) | $([math]::Round($avgMb, 1)) | $([math]::Round($maxMb, 1)) |"
  }

@(
  "# Superset Windows Performance Sample"
  ""
  "- Samples: $Samples"
  "- Interval seconds: $IntervalSeconds"
  "- CSV: $csvPath"
  ""
  "| Role | Rows | Avg working set MB | Max working set MB |"
  "|---|---:|---:|---:|"
  $byRole
) | Set-Content -Encoding UTF8 -Path $summaryPath

Write-Host "CSV: $csvPath"
Write-Host "Summary: $summaryPath"
