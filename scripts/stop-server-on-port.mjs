import { execFileSync } from "node:child_process";

const port = Number(process.env.PORT ?? 3000);

if (process.platform !== "win32" || !Number.isInteger(port) || port <= 0) {
  process.exit(0);
}

const command = `
$connection = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $connection) { exit 0 }
$process = Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.OwningProcess)"
if (-not $process) { exit 0 }
$commandLine = $process.CommandLine
$isNextServer = $commandLine -match 'node\\s+\\.next[\\\\/]standalone[\\\\/]server\\.js' -or
  $commandLine -match 'scripts[\\\\/]start-standalone\\.mjs' -or
  $commandLine -match 'next[\\\\/]dist[\\\\/]bin[\\\\/]next"?.*\\sdev(\\s|$)' -or
  $commandLine -match 'next[\\\\/]dist[\\\\/]server[\\\\/]lib[\\\\/]start-server\\.js'
if ($isNextServer) {
  Stop-Process -Id $process.ProcessId -Force
  Write-Output "Stopped existing Next server on port ${port} before start."
}
`;

execFileSync(
  "powershell.exe",
  ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
  { stdio: "inherit" },
);
