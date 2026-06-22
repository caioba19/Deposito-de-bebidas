-- Migração: adiciona suporte a preço promocional (preço original riscado + preço com desconto)
-- Rode este script apenas se você já criou o banco "Deposito_Bebidas" antes.
-- Se você está criando o banco do zero, ignore este arquivo — basta rodar o schema.sql atualizado.

USE Deposito_Bebidas;

ALTER TABLE produto
    ADD COLUMN preco_original DECIMAL(10,2) NULL;
