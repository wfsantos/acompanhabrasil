#!/usr/bin/env bash
# Script de Reinicialização Completa — AcompanhaBrasil (Bash / Linux / macOS)

echo "======================================================="
echo "   AcompanhaBrasil — Reinicialização Completa"
echo "======================================================="
echo ""

echo "[1/3] Parando instâncias ativas na porta 3000..."
PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PORT_PID" ]; then
    echo "Finalizando PID: $PORT_PID"
    kill -9 $PORT_PID 2>/dev/null
else
    echo "Nenhum processo ativo na porta 3000."
fi

echo ""
echo "[2/3] Instalando e atualizando dependências (npm install)..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao instalar dependências."
    exit 1
fi

echo ""
echo "[3/3] Iniciando o servidor AcompanhaBrasil..."
echo "Acesse: http://localhost:3000"
echo "Painel: http://localhost:3000/painel.html"
echo ""
npm start
