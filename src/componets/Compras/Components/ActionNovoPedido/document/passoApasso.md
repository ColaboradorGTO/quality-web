# Guia do Usuario - Novo Pedido de Compras

Este documento explica, em linguagem de usuario final, como criar um pedido, incluir produtos e concluir o processo ate o fechamento final.

## Objetivo

Ao final deste fluxo voce consegue:

1. Preencher e salvar o cabecalho do pedido.
2. Incluir um ou mais itens no pedido.
3. Corrigir mensagens de validacao comuns.
4. Finalizar o pedido sem pendencias.

---

## 1) Preencher o cabecalho do pedido

Antes de incluir produto, preencha os campos principais do cabecalho:

- Tipo de pedido
- Marca/empresa
- Fornecedor
- Condicao de pagamento
- Comprador
- Data do pedido e data de entrega
- Transportadora e tipo de frete
- Dados do vendedor (quando aplicavel)

Campos opcionais (nao bloqueiam o salvamento):

- Observacoes
- Percentuais de desconto
- Comissao
- E-mail do vendedor

Se algum campo obrigatorio estiver vazio ou invalido, o sistema mostra alerta com a lista do que falta preencher.

---

## 2) Salvar cabecalho (recomendado antes de incluir item)

Acao: clique em Salvar Pedido.

O sistema:

1. Valida os campos obrigatorios.
2. Pede confirmacao para salvar.
3. Cria o pedido (se ainda nao existir numero) ou atualiza o pedido existente.
4. Exibe mensagem de sucesso.

Dica pratica:

- Sempre confirme se o numero do pedido foi gerado antes de seguir para inclusao de itens.

---

## 3) Abrir modal de inclusao de produto

Acao: clique em Incluir Produto.

O sistema:

1. Revalida o cabecalho.
2. Se necessario, pergunta se o pedido sera por intermediario (Atacadista RN).
3. Cria/atualiza o cabecalho automaticamente.
4. Abre o modal de inclusao de item.

Titulo do modal:

- Pedido de REPOSICAO (quando aplicavel)
- Pedido de Produtos NOVOS

Quando for reposicao, varios campos ficam bloqueados para manter os dados do produto modelo.

---

## 4) Buscar produto modelo (principalmente em reposicao)

No modal:

1. Digite na busca de referencia/descricao (minimo de 5 caracteres).
2. Selecione o produto na lista.
3. Se marcar reposicao sem selecionar produto, o sistema bloqueia e orienta a selecionar primeiro.

Em reposicao, o sistema preenche automaticamente dados do produto selecionado (descricao, referencia, custo, venda, etc.) e pode bloquear edicao dos campos.

---

## 5) Preencher dados do item

Preencha os campos obrigatorios do item (conforme tipo de pedido/produto), por exemplo:

- Descricao
- Referencia
- Quantidade total
- Unidade
- Categoria
- Estrutura
- Cor
- Material de fabricacao
- Fabricante
- Local de exposicao
- Valores (unitario bruto, unitario liquido, venda, total)

Campos normalmente opcionais:

- Desconto I, II, III
- Observacao do item
- Quantidade de caixa

O sistema tambem exige grade de tamanhos valida.

---

## 6) Regras de validacao antes de incluir (funcao incluirItemNoPedido)

Ao clicar em Incluir, o sistema aplica as validacoes abaixo:

1. Campos obrigatorios do item.
2. Gradeamento de tamanhos.
3. Regras adicionais para produto novo.
4. Duplicidade de item no pedido.

### 6.1 Gradeamento de tamanhos

Regras:

- Nao pode ficar todo zerado.
- A distribuicao deve gerar quantidades exatas por tamanho.
- Se for reposicao, nao pode gradear com mais de um tamanho.

Se houver erro, o sistema mostra a mensagem e posiciona o foco no campo da grade para correcao.

### 6.2 Regras para produto novo (quando Reposicao = False)

O sistema bloqueia inclusao se:

- Ja existir produto cadastrado com a mesma descricao.
- A cor selecionada estiver marcada como bloqueada para novo produto.
- O tipo de material estiver marcado como bloqueado para novo produto.

### 6.3 Duplicidade no mesmo pedido

Mesmo com dados validos, a inclusao e impedida se o item ja existir no pedido. Neste caso, edite o item existente para aumentar quantidade.

---

## 7) Inclusao efetiva do item

Quando todas as validacoes passam:

1. O item e gravado no pedido.
2. O pedido e recalculado/atualizado.
3. O sistema grava log da operacao.
4. Exibe mensagem de sucesso.
5. Atualiza a lista de itens do pedido na tela.

Depois disso, voce pode repetir o processo para incluir outros produtos.

---

## 8) Revisar totais e cabecalho

Antes de finalizar:

1. Confira quantidade de itens.
2. Confira total bruto e total liquido.
3. Ajuste descontos/comissao no cabecalho, se necessario.
4. Salve novamente o cabecalho para garantir os ultimos ajustes.

---

## 9) Finalizar pedido (conclusao final)

Acao: clique em Fechar/Finalizar Pedido.

O sistema executa:

1. Validacao do cabecalho.
2. Validacao se existem itens cadastrados no pedido.
3. Validacao de pendencias (rascunho deve estar regularizado).
4. Confirmacao final com aviso de acao irreversivel.
5. Atualizacao de status para finalizado.
6. Registro em log.
7. Mensagem de sucesso e redirecionamento para dashboard de compras.

Se houver pendencia, o pedido nao sera finalizado ate que voce corrija os pontos indicados.

---

## 10) Erros comuns e como resolver

### Mensagem: "Preencha os campos"

- Revise os campos destacados.
- Em selects, abra e escolha um valor valido.

### Mensagem: "Erro no gradeamento de tamanhos"

- Ajuste os indices da grade para gerar quantidade exata.
- Em reposicao, deixe apenas um tamanho com valor maior que zero.

### Mensagem: "Ja existe produto com a mesma descricao"

- Altere a descricao para diferenciar o novo item.

### Mensagem: "Cor/Material bloqueado para novos produtos"

- Selecione outra opcao permitida para cadastro novo.

### Mensagem: "Este produto ja existe no pedido"

- Nao inclua novamente; edite o item existente para aumentar quantidade.

### Mensagem: "Pedido nao pode ser fechado"

- Inclua ao menos um item.
- Resolva pendencias exibidas na tela.
- Garanta que o pedido nao esteja em rascunho com pendencia aberta.

---

## Resumo rapido do fluxo

1. Preencher cabecalho.
2. Salvar cabecalho.
3. Abrir Incluir Produto.
4. Buscar produto modelo (quando necessario).
5. Preencher item + grade.
6. Clicar em Incluir.
7. Repetir para todos os itens.
8. Revisar totais e salvar cabecalho.
9. Finalizar pedido.

