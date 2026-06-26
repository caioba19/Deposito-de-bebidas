@echo off
title Rodar Backend - Deposito de Bebidas
echo Iniciando o Backend (Java Spring Boot)...
cd /d "%~dp0..\backend"
call mvnw.cmd spring-boot:run
if %errorlevel% neq 0 (
    echo.
    echo Ocorreu um erro ao tentar rodar o backend. Certifique-se de que o Java 17 esta instalado.
    pause
)
