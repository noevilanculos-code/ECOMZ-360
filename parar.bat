@echo off
title ECO-MZ 360 - Parar Plataforma
cd /d "%~dp0"

echo.
echo  ============================================================
echo    ECO-MZ 360 - Encerramento do Servidor
echo  ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$pids = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique; if ($pids) { foreach ($p in $pids) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue; Write-Host ('  [OK] Processo encerrado com sucesso (PID: ' + $p + ')') }; Write-Host ''; Write-Host '  [OK] Servidor ECO-MZ 360 finalizado com sucesso!' } else { Write-Host '  [INFO] Nenhum servidor ECO-MZ 360 ativo na porta 3000.' }"

echo.
pause
