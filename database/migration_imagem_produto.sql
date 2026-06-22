-- Migração: adiciona suporte a foto de produto
-- Rode este script apenas se você já criou o banco "Deposito_Bebidas" antes
-- (ou seja, já rodou o schema.sql original sem a coluna imagem_url).
-- Se você está criando o banco do zero, ignore este arquivo — basta rodar o schema.sql atualizado.

USE Deposito_Bebidas;

ALTER TABLE produto
    ADD COLUMN imagem_url VARCHAR(500) NULL;
