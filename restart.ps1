# Script de Reinicialização Completa — AcompanhaBrasil (PowerShell)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   AcompanhaBrasil — Reinicialização Completa" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Para processos ouvindo na porta 3000
Write-Host "[1/3] Verificando e finalizando processos na porta 3000..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        foreach ($pidToKill in $processes) {
            Write-Host "Finalizando processo PID: $pidToKill" -ForegroundColor DarkYellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "Nenhum processo ativo encontrado na porta 3000." -ForegroundColor Green
    }
} catch {
    Write-Host "Verificação de porta concluída." -ForegroundColor Gray
}

# 2. Executa npm install
Write-Host ""
Write-Host "[2/3] Instalando/atualizando dependências (npm install)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao instalar dependências." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 3. Executa npm start
Write-Host ""
Write-Host "[3/3] Iniciando o servidor AcompanhaBrasil..." -ForegroundColor Green
Write-Host "Aplicação disponível em: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Painel Público em:       http://localhost:3000/painel.html" -ForegroundColor Cyan
Write-Host ""
npm start
