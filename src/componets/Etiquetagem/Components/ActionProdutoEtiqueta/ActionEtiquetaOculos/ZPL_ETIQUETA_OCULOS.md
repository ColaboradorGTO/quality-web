# Etiqueta de Óculos — explicação do ZPL

Este documento explica, linha a linha, o código ZPL gerado em
[actionEtiquetaOculosModal.jsx](./actionEtiquetaOculosModal.jsx) (função `handlePrintZPL`)
e por que, às vezes, a etiqueta sai **invertida** (código de barras no lado esquerdo em vez do direito).

> Referências de medida: impressoras Zebra de 203 dpi → **8 dots = 1 mm**.
> Em 300 dpi → ~11,8 dots = 1 mm. Todas as coordenadas do ZPL são em *dots*.

---

## 1. Visão geral do fluxo

Para cada etiqueta é montado um bloco `^XA ... ^XZ` (um "formato" ZPL = uma etiqueta).
No final de todas as etiquetas é concatenado um bloco extra de "reset" de configuração.
Tudo é enviado via WebSocket (`ws://localhost:9090`) pelo
[labelPrinterService.js](../../../../../utils/labelPrinterService.js), que remove a indentação e as linhas vazias antes de enviar.

Exemplo do que chega na impressora para **uma** etiqueta:

```zpl
^XA
^FWN
^PW800
^LL80
^CI28
^FO5,25^A0,40,40^FB268,1,1,C,0^FDR$ 1.299,90^FS
^BY1.6,3,500
^FO270,10
^BEN,55,Y,N
^FD7891234567895^FS
^XZ
```

E, ao final de todas as etiquetas:

```zpl
^XA
^MD5
^FWN
^PW800
^LL80
^CI28
^XZ
```

---

## 2. Cabeçalho da etiqueta (`startPageLabel`)

| Linha   | Comando                  | O que faz |
|---------|--------------------------|-----------|
| `^XA`   | Start Format             | Abre o formato. Tudo até o `^XZ` é **uma etiqueta**. |
| `^FWN`  | Field Orientation Default | Define a orientação **padrão dos campos** (textos/códigos) como `N` = Normal (0°). Só vale para campos que não informam orientação própria — ex.: `^A0,40,40` (sem letra de orientação) herda o `N` daqui. **Não** controla a orientação da etiqueta inteira. |
| `^PW800`| Print Width              | Largura de impressão = 800 dots (≈ 100 mm em 203 dpi). É a "área útil" horizontal. |
| `^LL80` | Label Length             | Comprimento da etiqueta = 80 dots (≈ 10 mm em 203 dpi). |
| `^CI28` | Change International Font | Codificação **UTF‑8**, para acentos e o símbolo `R$` saírem corretos. |

---

## 3. Campo do preço

```zpl
^FO5,25^A0,40,40^FB268,1,1,C,0^FDR$ 1.299,90^FS
```

| Parte              | O que faz |
|--------------------|-----------|
| `^FO5,25`          | Field Origin: posiciona o campo em **x = 5**, **y = 25** dots (canto superior esquerdo do campo). |
| `^A0,40,40`        | Fonte `0` (fonte escalável padrão Zebra), altura 40 e largura 40 dots. A orientação foi omitida → usa o `^FWN`. No código a largura vira **35** quando o preço formatado tem mais de 12 caracteres (`widthFontPrecoVenda`), para caber. |
| `^FB268,1,1,C,0`   | Field Block: caixa de texto com **268 dots** de largura, **1** linha no máximo, espaçamento 1, alinhamento **C** (centralizado), recuo 0. É isso que centraliza o preço na metade **esquerda** da etiqueta (de x=5 até x=273). |
| `^FD...`           | Field Data: o texto impresso (preço formatado por `formatMoeda`). |
| `^FS`              | Field Separator: fecha o campo. |

---

## 4. Campo do código de barras

```zpl
^BY1.6,3,500
^FO270,10
^BEN,55,Y,N
^FD7891234567895^FS
```

| Linha           | O que faz |
|-----------------|-----------|
| `^BY1.6,3,500`  | Bar Code Field Default: largura do módulo (barra mais fina), razão barra larga/fina e altura padrão. **Atenção:** o módulo aceita apenas inteiros de 1 a 10 dots; o `1.6` é tratado pela impressora como **1** (o decimal não tem efeito). A razão `3` é ignorada no EAN‑13 (que tem razão fixa) e a altura `500` é sobrescrita pelo `55` do `^BE`. |
| `^FO270,10`     | Posiciona o código de barras em **x = 270**, **y = 10** → metade **direita** da etiqueta. |
| `^BEN,55,Y,N`   | Código **EAN‑13** (`^BE`), orientação `N` (normal), altura **55** dots, `Y` = imprime os números abaixo do código, `N` = não imprime os números acima. |
| `^FD...^FS`     | Os 13 dígitos do EAN (validados antes por `isValidEAN13`). |

## 5. Fechamento (`endPageLabel`)

| Linha | O que faz |
|-------|-----------|
| `^XZ` | End Format: fecha a etiqueta e manda imprimir. |

## 6. Bloco de reset (`zplResetConfiguracao`)

Enviado **uma vez** depois de todas as etiquetas:

| Linha    | O que faz |
|----------|-----------|
| `^XA`    | Abre um formato (sem campos → não imprime nada). |
| `^MD5`   | Media Darkness: ajusta o escurecimento para **+5** em relação ao valor base da impressora. |
| `^FWN`, `^PW800`, `^LL80`, `^CI28` | Repete as configurações do cabeçalho, para deixá-las como "estado atual" da impressora. |
| `^XZ`    | Fecha o formato. |

> Observação: esse bloco **não** redefine orientação (`^PO`), espelhamento (`^PM`) nem deslocamentos
> (`^LH`, `^LS`, `^LT`). Ou seja, ele não protege contra o problema descrito abaixo.

---

## 7. Layout esperado

```
x=0                        x≈270                                 x=800
┌──────────────────────────┬──────────────────────────────────────┐
│                          │ ║│║║│║│║║│║│║║│║                      │
│       R$ 1.299,90        │ ║│║║│║│║║│║│║║│║                      │
│  (centralizado em 268)   │ 7 891234 567895                      │
└──────────────────────────┴──────────────────────────────────────┘
   PREÇO (esquerda)          CÓDIGO DE BARRAS (direita)
```

---

## 8. Por que às vezes a impressão sai invertida?

### Causa principal: configurações que ficam "gravadas" na impressora

Vários comandos ZPL **não valem só para a etiqueta atual** — eles alteram o estado da impressora
e continuam valendo para os próximos jobs até alguém mudar (ou até desligar a impressora;
se alguém tiver mandado `^JUS`, ficam salvos **permanentemente**).

O nosso ZPL **não define** os comandos abaixo, então a etiqueta herda o que estiver na impressora:

| Comando | Valor "certo" | O que acontece se outro sistema deixou diferente |
|---------|---------------|--------------------------------------------------|
| `^PO` (Print Orientation) | `^PON` (normal) | Com `^POI` a etiqueta inteira gira **180°**: o código de barras vai para a **esquerda** e o preço para a direita, ambos de cabeça para baixo. |
| `^PM` (Mirror Image) | `^PMN` (sem espelho) | Com `^PMY` a etiqueta é **espelhada horizontalmente**: o código de barras vai para a **esquerda** e o texto sai espelhado (como visto no espelho). |
| `^LH` (Label Home) | `^LH0,0` | Desloca a origem de todos os campos; o conteúdo "anda" para os lados/para baixo. |
| `^LS` (Label Shift) | `^LS0` | Desloca tudo horizontalmente. |
| `^LT` (Label Top) | `^LT0` | Desloca tudo verticalmente. |

**Quem costuma alterar isso?**

- Outras telas/sistemas que imprimem na mesma Zebra (outro layout de etiqueta que usa `^POI`).
- O **driver do Windows** (ZDesigner) configurado com rotação 180° ou "espelhar".
- ZebraDesigner / Zebra Setup Utilities, que podem enviar `^POI`/`^PMY` e salvar com `^JUS`.
- Alguém que ajustou a impressora pelo painel/menu.

Por isso o comportamento parece "aleatório": depende de **qual foi o último job** que passou pela impressora
antes da nossa etiqueta.

### Como identificar qual é o caso

| Sintoma na etiqueta | Provável causa |
|---------------------|----------------|
| Código de barras à esquerda **e** tudo de cabeça para baixo | `^POI` (rotação 180°) ou rolo colocado ao contrário |
| Código de barras à esquerda, texto **espelhado** (letras invertidas) | `^PMY` (espelhamento) |
| Posição certa, mas tudo deslocado/cortado | `^LH`, `^LS`, `^LT` ou `^PW` diferentes; ou falta de calibração |

### Outras causas possíveis (físicas)

- **Rolo de etiqueta colocado ao contrário** ou etiquetas de um fornecedor com o sentido de corte diferente.
  Nesse caso o ZPL está certo, mas a etiqueta física está girada em relação à cabeça de impressão.
- **Impressoras diferentes** (203 dpi × 300 dpi, ou larguras de cabeça diferentes) — as coordenadas em dots
  mudam de tamanho físico, e o layout pode sair deslocado.
- **`^LL80` / `^PW800` diferentes da etiqueta real**: quando há rotação `^POI`, a impressora gira em torno
  da área definida por `^PW`/`^LL`; se não baterem com a etiqueta física, o conteúdo além de girar sai
  em posição errada.

---

## 9. Correção recomendada

Deixar **explícito** no cabeçalho de toda etiqueta tudo o que pode ter sido alterado por outro sistema.
Assim a nossa etiqueta sempre sai igual, independente do último job:

```js
let startPageLabel = `
  ^XA
  ^PON
  ^PMN
  ^LH0,0
  ^LS0
  ^LT0
  ^FWN
  ^PW800
  ^LL80
  ^CI28
`;
```

| Novo comando | Motivo |
|--------------|--------|
| `^PON`   | Força orientação normal (desfaz um `^POI` deixado por outro sistema). |
| `^PMN`   | Desliga o espelhamento. |
| `^LH0,0` | Zera a origem da etiqueta. |
| `^LS0`   | Zera o deslocamento horizontal. |
| `^LT0`   | Zera o deslocamento vertical. |

Opcionalmente, incluir os mesmos comandos no `zplResetConfiguracao`, para devolver a impressora a um
estado conhecido após a nossa impressão.

Ajustes secundários sugeridos:

- Trocar `^BY1.6,3,500` por `^BY2` (ou `^BY1`) — o valor decimal não tem efeito.
- Se o problema persistir mesmo com `^PON`/`^PMN`, verificar **fisicamente** o sentido do rolo e a
  configuração de orientação no driver do Windows / serviço de impressão da porta 9090.
