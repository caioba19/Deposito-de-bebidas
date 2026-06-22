# Depósito de Bebidas — Sistema de Gestão + Loja

Sistema full-stack para um depósito de bebidas, com **duas frentes**:

- **Loja pública** (`/`): catálogo de produtos, carrinho de compras e checkout — onde o cliente final navega e faz pedidos.
- **Painel administrativo** (`/admin`): gestão interna de **Cliente**, **Produto** e **Pedido** — onde a equipe do depósito cadastra e acompanha tudo.

As duas interfaces compartilham o mesmo backend e banco de dados; o checkout da loja usa os mesmos endpoints `/api/clientes` e `/api/pedidos` que o painel admin.

- **Backend:** Java 17 + Spring Boot 3 (API REST) + Spring Data JPA
- **Frontend:** React + Vite
- **Banco de dados:** MySQL

---

## Estrutura do projeto

```
deposito-bebidas/
├── backend/        # API REST em Spring Boot
├── frontend/        # Interface em React (loja + painel admin)
└── database/        # Script SQL de criação do banco
```

---

## 1. Configurar o banco de dados

1. Abra o MySQL (Workbench, terminal ou outra ferramenta de sua preferência).
2. Execute o script `database/schema.sql` para criar o banco `Deposito_Bebidas` e todas as tabelas.

```bash
mysql -u root -p < database/schema.sql
```

> **Já tinha criado o banco antes?** Rode também `database/migration_imagem_produto.sql` e `database/migration_preco_original.sql` — eles adicionam, respectivamente, a coluna de foto e a coluna de preço promocional numa tabela que já existe, sem precisar recriar tudo do zero.

---

## 2. Rodar o backend (Spring Boot)

### Pré-requisitos
- Java 17+
- Maven instalado (ou use o `mvn` que vier configurado na sua IDE)

### Passos

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```

2. Edite `src/main/resources/application.properties` com o usuário e senha do seu MySQL:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=SUA_SENHA_AQUI
   ```

3. Rode a aplicação:
   ```bash
   mvn spring-boot:run
   ```

4. A API vai subir em `http://localhost:8080`. Endpoints disponíveis:

   | Método | Endpoint              | Descrição              |
   |--------|------------------------|--------------------------|
   | GET    | `/api/clientes`        | Lista clientes           |
   | POST   | `/api/clientes`        | Cria cliente              |
   | PUT    | `/api/clientes/{id}`   | Atualiza cliente          |
   | DELETE | `/api/clientes/{id}`   | Remove cliente            |
   | GET    | `/api/produtos`        | Lista produtos           |
   | POST   | `/api/produtos`        | Cria produto               |
   | PUT    | `/api/produtos/{id}`   | Atualiza produto           |
   | DELETE | `/api/produtos/{id}`   | Remove produto             |
   | GET    | `/api/pedidos`         | Lista pedidos (com itens) |
   | POST   | `/api/pedidos`         | Cria pedido com itens      |
   | DELETE | `/api/pedidos/{id}`    | Remove pedido               |

---

## 3. Rodar o frontend (React)

### Pré-requisitos
- Node.js 18+

### Passos

1. Em outro terminal, entre na pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:5173` no navegador — essa é a **loja**. O painel administrativo fica em `http://localhost:5173/admin` (também tem um link discreto "Painel administrativo" no rodapé da loja, e um link "← Ver loja" no menu lateral do admin). O Vite já está configurado para redirecionar chamadas `/api` para o backend em `localhost:8080`.

---

## Observações importantes

- O backend usa `spring.jpa.hibernate.ddl-auto=none`, ou seja, **ele não cria as tabelas automaticamente** — o banco precisa ser criado antes via `database/schema.sql`.
- Os campos `dataNascimento` (Cliente) usam o formato `YYYY-MM-DD`.
- Ao criar um pedido, o preço unitário de cada item é capturado automaticamente do preço atual do produto no momento da criação.
- **O estoque é descontado automaticamente** ao criar um pedido, dentro de uma transação única (`@Transactional`): se qualquer parte do processo falhar, nada é salvo — não existe risco de "estoque descontado sem pedido salvo". Se a quantidade pedida for maior que o disponível, a API retorna erro 400 com a mensagem explicando qual produto está sem estoque suficiente.
- Excluir um pedido **não devolve** o estoque automaticamente (isso seria responsabilidade de um módulo de estorno, fora do escopo atual).
- Os endpoints de Cliente e Produto validam os dados de entrada (campos obrigatórios, valores positivos) e retornam erro 400 com mensagens claras em caso de dado inválido.
- **Checkout da loja**: ao finalizar um pedido na loja pública, o sistema verifica se já existe um cliente com o CPF informado (evita duplicar cadastro) — se existir, reaproveita o cliente; se não, cria um novo. O pedido é criado normalmente, descontando estoque como qualquer outro.
- **Foto de produto**: ao cadastrar/editar um produto no admin, você pode colar a URL de uma imagem (precisa estar hospedada em algum lugar público — ex: Imgur, um link direto de imagem, etc; o sistema não faz upload de arquivo, só guarda o link). A loja mostra a foto real quando ela existe; se não tiver, mostra um ícone neutro no lugar. **Importante**: use fotos que você tem direito de usar (fotos próprias dos produtos, ou imagens licenciadas para uso comercial) — não fotos de produto copiadas de outros sites/lojas.
- **Preço promocional**: o campo "Preço original" no cadastro de Produto é opcional. Se preenchido com um valor maior que o preço de venda, a loja mostra o preço riscado + um selo de desconto (%) calculado automaticamente. Se deixado vazio, o produto aparece sem promoção.
- **Temas visuais separados**: o painel admin (`/admin`) usa um tema escuro/âmbar; a loja pública (`/`) usa um tema claro/azul, com elementos de loja (frete grátis com barra de progresso, desconto no Pix calculado em tempo real, selo de desconto) — pensados pra parecer uma loja de verdade, não um painel interno. O desconto no Pix (5%) é só um valor de exibição do projeto — não existe integração de pagamento real, então o pedido salvo no banco sempre guarda o preço cheio dos itens.
- O CORS já está liberado para `localhost:5173` (Vite) e `localhost:3000`.

## Possíveis melhorias futuras (fora do escopo atual)

- Módulos de Fornecedor, Funcionário, Pagamento, Estorno e Reabastecimento (tabelas já existem no banco).
- Devolução de estoque ao excluir/estornar um pedido.
- Trava de concorrência (lock) no desconto de estoque: hoje, dois pedidos simultâneos para o mesmo produto, em alta concorrência, poderiam disputar a mesma unidade em estoque sem trava pessimista. Suficiente para uso sequencial/demonstração; relevante apenas em cenário de múltiplos usuários simultâneos.
- Autenticação/login (tanto para clientes da loja quanto para a equipe do admin — hoje qualquer um que acesse `/admin` consegue gerenciar os dados).
- Fotos reais de produto: a loja usa um ícone ilustrativo no lugar de foto, já que o banco não tem uma coluna de imagem.
- "Meus pedidos" para o cliente da loja consultar pedidos anteriores (hoje não há login, então não há como vincular um cliente que retorna à sua sessão).
- Paginação nas listagens.
