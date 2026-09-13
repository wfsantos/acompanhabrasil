@echo off
chcp 65001 > nul
echo =======================================================
echo    AcompanhaBrasil — Reinicializacao Completa
echo =======================================================
echo.

echo [1/3] Parando instancias ativas do Node / Servidor (Porta 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)

echo [2/3] Instalando e atualizando dependencias (npm install)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Iniciando o servidor AcompanhaBrasil...
echo Acesse: http://localhost:3000
echo.
call npm start
