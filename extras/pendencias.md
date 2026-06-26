# Pendências do Projeto — Depósito de Bebidas

> Documento de controle de tarefas, bugs e melhorias identificadas antes da entrega final.

---

## ✅ Concluídas

| # | Tarefa |
|---|--------|
| 1 | Corrigir percentual de desconto Pix — padronizado em todo o projeto |
| 2 | Adicionar testes básicos no backend (cadastro de cliente, produto e pedido) |
| 3 | Revisar `README.md` para refletir o estado atual do sistema |
| 4 | Configurar `.gitignore` da raiz para ignorar logs e arquivos locais |
| 5 | Corrigir conexão do backend com o banco de dados |
| 6 | Revisar textos e acentuação nos arquivos de documentação |
| 7 | Adicionar Maven Wrapper (`mvnw`) ao backend — permite rodar o projeto sem Maven instalado globalmente |
| 8 | Revisar `PedidosPage.jsx` e `ProdutosPage.jsx` — validações de `maxLength` e exibição de dados |
| 9 | Adicionar pasta `scratch/` ao `.gitignore` da raiz |

---

## 🐛 Bugs Identificados

### 🔴 Críticos

#### Bug 1 — `PedidoController` retorna tipo errado nas respostas de erro
**Arquivo:** `backend/src/main/java/com/deposito/controller/PedidoController.java`  
**Linhas afetadas:** 45, 50, 53, 60, 74

**Problema:** O controller retorna `String` pura em alguns erros (ex: `body("Cliente não encontrado.")`), mas o `GlobalExceptionHandler` e os demais controllers retornam `Map<String, String>`. O frontend tenta ler `dados?.mensagem`, que só funciona com JSON. Quando recebe `String` pura, cai no handler genérico e exibe *"Ocorreu um erro inesperado no servidor."*

**Correção:** Substituir todos os `body("string pura")` por `body(Map.of("mensagem", "texto"))`.

---

#### Bug 2 — Estoque não é restaurado ao deletar pedido
**Arquivo:** `backend/src/main/java/com/deposito/controller/PedidoController.java`

**Problema:** O endpoint `DELETE /api/pedidos/{id}` remove o pedido, mas não devolve as quantidades dos itens ao estoque dos produtos — causando discrepância permanente no inventário.

**Correção:** Antes de deletar, buscar os itens do pedido e somar as quantidades de volta ao estoque de cada produto.

---

### 🟡 Médios

#### Bug 3 — Testes de pedido quebrados após correção do Bug 1
**Arquivo:** `backend/src/test/java/com/deposito/controller/PedidoControllerTest.java`

**Problema:** Os testes verificam `content().string("Cliente não encontrado.")` (String pura). Após a correção do Bug 1, as assertions precisam ser atualizadas.

**Correção:** Substituir por `jsonPath("$.mensagem").value("Cliente não encontrado.")`.

---

#### Bug 4 — Função `sanitizeImageUrl` duplicada no frontend
**Arquivos:** `frontend/src/pages/ProdutosPage.jsx` e `frontend/src/pages/LojaPage.jsx`

**Problema:** A mesma função está copiada nos dois arquivos. Qualquer alteração futura precisa ser feita em dois lugares — propenso a inconsistências.

**Correção:** Criar `frontend/src/utils/imageUtils.js` com a função centralizada e importar nos dois arquivos.

---

#### Bug 5 — `COMO_RODAR.md` cita `mvn` em vez de `mvnw`
**Arquivo:** `faculdade/COMO_RODAR.md`

**Problema:** A "Opção B" do guia usa `mvn spring-boot:run`, mas o projeto usa o Maven Wrapper. Quem não tiver o Maven instalado globalmente vai ter erro ao seguir o guia.

**Correção:** Substituir por `.\mvnw.cmd spring-boot:run` (Windows).

---

## 📋 Mudanças Propostas

### Backend

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `PedidoController.java` | Modificar | Padronizar respostas de erro para `Map<String, String>` + restaurar estoque no `DELETE` |
| `PedidoControllerTest.java` | Modificar | Atualizar assertions para `jsonPath("$.mensagem")` |

### Frontend

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `utils/imageUtils.js` | Criar | Centralizar `sanitizeImageUrl` |
| `ProdutosPage.jsx` | Modificar | Remover função local e importar de `imageUtils.js` |
| `LojaPage.jsx` | Modificar | Remover função local e importar de `imageUtils.js` |

### Documentação

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `COMO_RODAR.md` | Modificar | Corrigir comando para `.\mvnw.cmd spring-boot:run` |

---

## ✔️ Plano de Verificação

### Testes automatizados

```bash
.\mvnw.cmd test
```

> Todos os 10 testes devem passar, incluindo os de pedido após atualização das assertions.

### Verificação manual

- [ ] Criar um pedido no painel admin — deve funcionar sem erros
- [ ] Deletar um pedido — verificar que o estoque dos produtos foi restaurado
- [ ] Testar mensagens de erro nos formulários (ex: pedido sem cliente selecionado)