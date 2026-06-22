CREATE DATABASE Deposito_Bebidas;

USE Deposito_Bebidas;

CREATE TABLE Cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    datanasci DATE,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(15),
    endereco VARCHAR(150),
    cep VARCHAR(10)
);

CREATE TABLE funcionarios(
id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(40) NOT NULL,
    email VARCHAR(40),
    salario DECIMAL(10,2)
);

CREATE TABLE fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    razaosocial VARCHAR(100) NOT NULL,
    nomefantasia VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(15),
    endereco VARCHAR(150),
    email VARCHAR(40),
    referencia VARCHAR(150)
);

CREATE TABLE produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    preco DECIMAL(10,2) NOT NULL,
    valor_custo DECIMAL(10,2) NOT NULL,
    estoque INT,
    imagem_url VARCHAR(500),
    preco_original DECIMAL(10,2)
);

CREATE TABLE pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    data_pedido DATE,
    id_cliente INT,

    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente)
);

CREATE TABLE item_pedido (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    id_produto INT,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2),

    FOREIGN KEY (id_pedido)
    REFERENCES pedido(id_pedido),

    FOREIGN KEY (id_produto)
    REFERENCES produto(id_produto)
);

CREATE TABLE reabastecimento (
    id_reabastecimento INT AUTO_INCREMENT PRIMARY KEY,
    data_reabastecimento DATETIME,
    id_fornecedor INT,
    id_funcionario INT,
estoque_min INT default 10,
    estoque_max INT default 100,
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor),
    FOREIGN KEY (id_funcionario) REFERENCES funcionarios(id_funcionario)
);

CREATE TABLE item_reabastecimento (
    id_item_reabastecimento INT AUTO_INCREMENT PRIMARY KEY,
    id_reabastecimento INT,
    id_produto INT,
    quantidade INT,
    preco_compra DECIMAL(10,2),

    FOREIGN KEY (id_reabastecimento) REFERENCES reabastecimento(id_reabastecimento),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

CREATE TABLE estorno (
    id_estorno INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    data_estorno DATETIME,
    motivo VARCHAR(255),
    valor_estornado DECIMAL(10,2),

    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);

CREATE TABLE pagamento (
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    forma_pagamento VARCHAR(50),
    valor DECIMAL(10,2),

    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);
