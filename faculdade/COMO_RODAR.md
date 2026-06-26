# Guia Rápido: Como Rodar o Projeto na Faculdade

Este guia foi criado para ajudar você a rodar o projeto rapidamente em qualquer computador da faculdade.

---

## Pré-requisitos Necessários no Computador da Faculdade

Para que tudo funcione, o computador precisa ter instalado:
1. **Java JDK 17** ou superior (necessário para rodar o backend).
2. **Node.js** (versão 18 ou superior) (necessário para rodar o frontend).
3. **Maven** instalado (opcional, pois você pode rodar pela IDE).

---

## Passo 1: Configurar a Conexão com o Banco de Dados
O projeto já está configurado para conectar diretamente ao banco de dados hospedado na nuvem (Railway). 
Portanto, **você não precisa instalar ou rodar o MySQL localmente no computador da faculdade**, contanto que a máquina tenha acesso à internet.

Se você precisar alterar as credenciais ou apontar para um banco local da faculdade, edite o arquivo:
👉 `backend/src/main/resources/application.properties`

---

## Passo 2: Rodar o Backend (Java Spring Boot)

### Opção A: Pela IDE (Recomendado)
1. Abra a IDE disponível na faculdade (IntelliJ IDEA, Eclipse, NetBeans ou VS Code).
2. Importe/abra a pasta `backend` como um projeto Maven.
3. Aguarde a IDE baixar as dependências automaticamente.
4. Execute o arquivo principal da aplicação: `src/main/java/com/deposito/DepositoApplication.java`.

### Opção B: Pelo Terminal / Prompt de Comando
Você pode dar dois cliques no script automatizado na pasta `faculdade`:
👉 Double-click no arquivo [rodar-backend.bat](file:///c:/Users/caiov/Documents/Deposito-de-bebidas/faculdade/rodar-backend.bat)

Ou digite no terminal dentro da pasta `backend`:
```bash
mvn spring-boot:run
```
*A API estará disponível em `http://localhost:8080`.*

---

## Passo 3: Rodar o Frontend (React + Vite)

Como é a primeira vez rodando no computador da faculdade, você precisa baixar as dependências (`node_modules`) do frontend.

### Opção Automatizada (Recomendada)
Dê dois cliques no script:
👉 Double-click no arquivo [rodar-frontend.bat](file:///c:/Users/caiov/Documents/Deposito-de-bebidas/faculdade/rodar-frontend.bat)
*(Ele executará o `npm install` e iniciará o servidor automaticamente para você).*

### Opção Manual
1. Abra o Prompt de Comando (CMD) na pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```
*O frontend estará disponível em `http://localhost:5173` ou `http://localhost:5174`.*

---

## Acessando as Telas
* **Loja Pública:** Acesse `http://localhost:5173` (ou a porta indicada pelo terminal do Vite).
* **Modo Administrador (Painel):** Acesse `http://localhost:5173/admin` (ou clique no link "Painel administrativo" no rodapé da loja).
