@echo off
title Rodar Frontend - Deposito de Bebidas
echo Iniciando o Frontend (React + Vite)...
cd /d "%~dp0..\frontend"
if not exist node_modules (
    echo Pasta node_modules nao encontrada. Instalando dependencias (isso pode levar alguns minutos)...
    call npm install
)
echo Iniciando servidor de desenvolvimento...
call npm run dev
pause
