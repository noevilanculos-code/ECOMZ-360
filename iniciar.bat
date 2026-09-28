@echo off
setlocal
title ECO-MZ 360 - Plataforma Ambiental
cd /d "%~dp0"
set "ECO_MZ_ROOT=%CD%"
set "ECO_MZ_URL=http://localhost:3000"

echo.
echo  ============================================================
echo    ECO-MZ 360 - Plataforma Ambiental de Mocambique
echo  ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 goto :erro_node
for /f "delims=." %%V in ('node -p "process.versions.node.split('.')[0]"') do set "NODE_MAJOR=%%V"
if not defined NODE_MAJOR goto :erro_node_version
if %NODE_MAJOR% LSS 18 goto :erro_node_version
echo  [OK] Node.js %NODE_MAJOR% detectado.

where npm >nul 2>nul
if errorlevel 1 goto :erro_npm_missing

if exist "node_modules\.bin\tsx.cmd" goto :check_env
echo  [INFO] Dependencias ausentes; a instalar pelo package-lock.json...
if exist "package-lock.json" (
    call npm ci
) else (
    call npm install
)
if errorlevel 1 goto :erro_instalacao

:check_env
if exist ".env" goto :check_port
if not exist ".env.example" goto :check_port
copy /Y ".env.example" ".env" >nul
echo  [INFO] Foi criado .env a partir de .env.example.
echo  [INFO] Configure GEMINI_API_KEY e as credenciais do banco conforme necessario.

:check_port
powershell -NoProfile -ExecutionPolicy Bypass -Command "$root=$env:ECO_MZ_ROOT; $listeners=@(Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue); if (!$listeners) { exit 0 }; foreach ($listener in $listeners) { $process=Get-CimInstance Win32_Process -Filter ('ProcessId=' + $listener.OwningProcess); if ($process.CommandLine -and $process.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 -and $process.CommandLine -match '(?i)(server\.ts|dist[\\/]server\.cjs)') { exit 10 } }; exit 20"
if %errorlevel% equ 10 goto :already_running
if %errorlevel% neq 0 goto :erro_porta

echo.
echo  [INFO] A iniciar o servidor em %ECO_MZ_URL%...
start "" /b powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(60); while ((Get-Date) -lt $deadline) { try { $health=Invoke-RestMethod -Uri 'http://localhost:3000/api/health' -TimeoutSec 2; if ($health.status -eq 'ok') { Start-Process 'http://localhost:3000'; exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; Write-Host 'O servidor nao respondeu em 60 segundos.'"
echo  [INFO] O navegador sera aberto quando /api/health responder.
echo  [INFO] Mantenha esta janela aberta; execute parar.bat para encerrar.
echo.
call npm run dev
echo.
echo  [INFO] O servidor ECO-MZ 360 foi encerrado.
pause
exit /b 0

:already_running
echo  [INFO] Ja existe um servidor ECO-MZ 360 deste projeto na porta 3000.
start "" "%ECO_MZ_URL%"
exit /b 0

:erro_node
echo  [ERRO] Node.js nao foi encontrado. Instale Node.js 18 ou superior em https://nodejs.org/
goto :erro_final

:erro_node_version
echo  [ERRO] Este projeto requer Node.js 18 ou superior.
goto :erro_final

:erro_npm_missing
echo  [ERRO] npm nao foi encontrado. Reinstale Node.js incluindo npm.
goto :erro_final

:erro_instalacao
echo  [ERRO] Falha ao instalar as dependencias do projeto.
goto :erro_final

:erro_porta
echo  [ERRO] A porta 3000 esta ocupada por outro processo.
echo  Nenhum processo foi encerrado. Feche o servico que usa a porta e tente novamente.
goto :erro_final

:erro_final
echo.
pause
exit /b 1
