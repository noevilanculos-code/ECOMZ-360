@echo off
setlocal
title ECO-MZ 360 - Parar Plataforma
cd /d "%~dp0"
set "ECO_MZ_ROOT=%CD%"

echo.
echo  ============================================================
echo    ECO-MZ 360 - Encerramento do Servidor
echo  ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$root=$env:ECO_MZ_ROOT; $listeners=@(Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue); if (!$listeners) { Write-Host '  [INFO] Nenhum servidor ativo na porta 3000.'; exit 0 }; $stopped=$false; foreach ($listener in $listeners) { $process=Get-CimInstance Win32_Process -Filter ('ProcessId=' + $listener.OwningProcess); $belongsToProject=$process.CommandLine -and $process.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 -and $process.CommandLine -match '(?i)(server\.ts|dist[\\/]server\.cjs)'; if ($belongsToProject) { Stop-Process -Id $listener.OwningProcess -Force; Write-Host ('  [OK] Servidor deste projeto encerrado (PID: ' + $listener.OwningProcess + ')'); $stopped=$true } }; if ($stopped) { exit 0 }; Write-Host '  [AVISO] A porta 3000 pertence a outro processo. Nada foi encerrado.'; exit 2"
if errorlevel 2 goto :manual_stop
echo.
pause
exit /b 0

:manual_stop
echo  Verifique o processo que utiliza a porta 3000 antes de o encerrar.
echo.
pause
exit /b 2
