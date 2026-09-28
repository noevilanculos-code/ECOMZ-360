@echo off
title ECO-MZ 360 - Plataforma Ambiental
cd /d "%~dp0"

echo.
echo  ============================================================
echo    ECO-MZ 360 - Plataforma Ambiental de Mocambique
echo  ============================================================
echo.

:: 1. Verificar se Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 goto :erro_node
echo  [OK] Node.js detectado com sucesso.
goto :check_modules

:erro_node
echo  [ERRO] Node.js nao foi detectado no sistema!
echo  Por favor instale o Node.js versao 18 ou superior em:
echo  https://nodejs.org/
echo.
pause
exit /b 1

:check_modules
:: 2. Instalar dependencias se a pasta node_modules nao existir
if not exist "node_modules" goto :instalar_deps
goto :check_env

:instalar_deps
echo.
echo  [INFO] Pasta node_modules nao encontrada.
echo  [INFO] A instalar dependencias do projeto com npm install...
call npm install
if %errorlevel% neq 0 goto :erro_npm
echo  [OK] Dependencias instaladas com sucesso.
goto :check_env

:erro_npm
echo  [ERRO] Falha ao instalar dependencias com npm install.
pause
exit /b 1

:check_env
:: 3. Criar arquivo .env a partir de .env.example se necessario
if not exist ".env" (
    if exist ".env.example" copy ".env.example" ".env" >nul 2>nul
)

:: 4. Garantir que a porta 3000 esta livre
powershell -NoProfile -ExecutionPolicy Bypass -Command "$pids = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique; if ($pids) { foreach ($p in $pids) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue; Write-Host ('  [INFO] Porta 3000 libertada - PID: ' + $p) } }"

echo.
echo  ============================================================
echo    Servidor a iniciar em: http://localhost:3000
echo    Para encerrar: feche esta janela ou execute parar.bat
echo  ============================================================
echo.

:: 5. Abrir navegador automaticamente em segundo plano
start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"

:: 6. Iniciar o servidor
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo  [AVISO] O servidor foi interrompido.
)

echo.
pause
