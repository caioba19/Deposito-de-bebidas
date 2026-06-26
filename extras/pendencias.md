# Pendências do projeto

Lista curta do que ainda vale ajustar antes da entrega.

## Essencial

- [x] Corrigir a porcentagem do desconto no Pix para ficar igual em todo o projeto
- [x] Adicionar testes básicos no backend para cadastro de cliente, produto e pedido
- [x] Revisar o `README.md` para refletir o que já existe hoje no sistema
- [x] Ignorar logs e arquivos locais no `.gitignore` da raiz
- [x] Corrigir conexão do backend com o banco de dados
- [x] Organizar melhor os textos e acentuação dos arquivos de documentação

## Melhorias Identificadas (A Fazer)

- [x] Adicionar Maven Wrapper (`mvnw`) ao backend para que o projeto possa ser iniciado pelo terminal e pelo `rodar-backend.bat` sem precisar do Maven instalado globalmente
- [x] Revisar `PedidosPage.jsx` e `ProdutosPage.jsx` em detalhe: verificar validações de tamanho (`maxLength`) nos formulários e possíveis problemas de exibição de dados
- [x] Adicionar a pasta `scratch/` ao `.gitignore` da raiz para não subir arquivos temporários de seed/teste para o repositório

Correção de Bugs e Limpeza do Projeto
Análise completa do código identificou 5 bugs reais e 2 problemas de duplicação de código. Nenhum arquivo precisa ser deletado, pois não há arquivos duplicados — o que existe é lógica duplicada dentro do código.

Bugs Encontrados
🔴 Bug 1 — CRÍTICO: PedidoController retorna tipo errado nas respostas de erro
Arquivo: backend/src/main/java/com/deposito/controller/PedidoController.java

Problema: O controller retorna String pura em alguns erros (body("Cliente não encontrado.")), mas o GlobalExceptionHandler e os outros controllers retornam Map<String, String>. O frontend tenta ler dados?.mensagem, que só funciona com JSON/Map. Quando recebe String pura, cai no handler genérico e exibe "Ocorreu um erro inesperado no servidor." — que é exatamente o erro que você está vendo.

Linhas afetadas: 45, 50, 53, 60, 74

🔴 Bug 2 — Estoque não é restaurado ao deletar pedido
Arquivo: backend/src/main/java/com/deposito/controller/PedidoController.java

Problema: O endpoint DELETE /api/pedidos/{id} apenas remove o pedido do banco, mas não devolve as quantidades dos itens ao estoque dos produtos. Isso causa discrepância permanente no inventário.

🟡 Bug 3 — Testes de pedido ficam quebrados após correção do Bug 1
Arquivo: backend/src/test/java/com/deposito/controller/PedidoControllerTest.java

Problema: Os testes verificam content().string("Cliente não encontrado.") (String pura). Após corrigir o Bug 1 para retornar JSON, os testes precisam ser atualizados para verificar jsonPath("$.mensagem").

🟡 Bug 4 — sanitizeImageUrl duplicada no frontend
Arquivos: frontend/src/pages/ProdutosPage.jsx e frontend/src/pages/LojaPage.jsx

Problema: A mesma função sanitizeImageUrl está copiada e colada nos dois arquivos. Se a regra mudar (ex: aceitar http:// também), precisaria ser alterada em dois lugares — propenso a bugs de manutenção.

🟡 Bug 5 — COMO_RODAR.md cita mvn em vez de mvnw
Arquivo: faculdade/COMO_RODAR.md

Problema: A "Opção B" do guia mostra o comando mvn spring-boot:run, mas o projeto usa o Maven Wrapper (mvnw/mvnw.cmd). Quem seguir esse guia sem Maven global instalado vai ter erro no terminal.

Proposed Changes
Backend — Correção de Bugs Críticos
[MODIFY] 
PedidoController.java
Substituir todos os body("string pura") por body(Map.of("mensagem", "string")) para ficar consistente com o GlobalExceptionHandler
Adicionar lógica de restauração de estoque no DELETE — buscar os itens do pedido antes de deletar e somar de volta ao estoque de cada produto
[MODIFY] 
PedidoControllerTest.java
Atualizar assertions que verificam content().string(...) para jsonPath("$.mensagem").value(...)
Frontend — Limpeza de Código Duplicado
[NEW] 
imageUtils.js
Criar arquivo com a função sanitizeImageUrl em local único
[MODIFY] 
ProdutosPage.jsx
Remover definição local de sanitizeImageUrl e importar do novo utils/imageUtils.js
[MODIFY] 
LojaPage.jsx
Remover definição local de sanitizeImageUrl e importar do novo utils/imageUtils.js
Documentação
[MODIFY] 
COMO_RODAR.md
Corrigir comando mvn spring-boot:run para .\mvnw.cmd spring-boot:run (Windows)
Verification Plan
Automated Tests
.\mvnw.cmd test
Todos os 10 testes devem passar (incluindo os de pedido após atualização das assertions).

Manual Verification
Criar um pedido no painel admin: deve funcionar sem erros
Deletar um pedido: verificar que o estoque dos produtos voltou
Testar mensagens de erro corretas nos formulários (ex: pedido sem cliente)