import React, { Fragment } from "react";
import { toFloat } from "../../../../utils/toFloat";


export const ActionListaDistribuicaoSugestoesHistorico = ({ dadosSugestoesHistorico }) => {

  const processarDados = (dados) => {
    return dados.map((item) => {
      const filiais = Array.isArray(item.filial) ? item.filial.map(f => ({
        IdFilial: f.IdFilial,
        DescFilial: f.DescFilial,
        totalqtd: 0 // Inicializa para cada filial
      })) : [];
  
      const sugestoes = item.Sugestao || [];
  
      // Percorre cada filial e calcula o total para cada uma individualmente
      filiais.forEach(filial => {
        sugestoes.forEach(sug => {
          if (sug.IdFilial === filial.IdFilial) {
            const qtdSugestaoAlterada = sug.QtdSugestaoAlteracao === 0 ? sug.QtdSugestao : sug.QtdSugestaoAlteracao;
            filial.totalqtd += parseInt(qtdSugestaoAlterada);
          }
        });
      });
      console.log(sugestoes, 'sugestoes')
  
      return {
        DescProduto: item.DescProduto,
        CodBarras: item.CodBarras,
        Grade: item.Grade,
        IdEmpresa: item.IdEmpresa,
        IdPedidoCompra: item.IdPedidoCompra,
        PrecoVenda: item.PrecoVenda,
        QtdGrade: item.QtdGrade,
        StConcluido: item.StConcluido,
        Filiais: filiais, // Agora cada filial tem seu próprio totalqtd
        Sugestao: sugestoes
      };
    });
  };
  


  const dadosProcessados = processarDados(dadosSugestoesHistorico);


  const handleSugestaoAlteradaChange = (codBarras, idDistribuicaoCompras, valor) => {
    console.log("Alteração de sugestão: ", codBarras, idDistribuicaoCompras, valor);
  };

  return (
    <Fragment>
      <div className="scroll table-responsive">
        <table id="dt-basic-distribuicao" className="table table-bordered table-hover table-striped w-100">
          <thead className="bg-primary-600" style={{ height: '300px' }}>
            <tr id="dt-basic-distribuicao-titulo">
              <th>Produto</th>
              <th>Valor</th>
              <th>Qtd</th>

              <th>Grade</th>
              <th>Total</th>
              {/* Renderiza as filiais no cabeçalho */}

              {dadosProcessados.length > 0 && dadosProcessados[0]?.Filiais.map((filial) => (
                <th key={filial.IdFilial} style={{ alignContent: 'end', margin: '0px', padding: '0px' }}>
                  {/* <span style={{ width: '200px', height: '20%', backgroundColor: 'red' }} className="rotate-270 text-nowrap h-200 d-flex pos-top"> */}
                  <p style={{ width: '45px', marginBottom: '30px' }} className="rotate-270 text-nowrap h-200 d-flex pos-top">
                    {filial.DescFilial}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dadosProcessados.map((row, index) => (
              <tr key={index}>
                <td>
                  <p style={{ width: '350px', fontWeight: 700 }}>{row.DescProduto}</p>
                </td>
                <td style={{ fontWeight: 500 }}>{row.PrecoVenda}</td>
                <td style={{ fontWeight: 500 }}>{row.QtdGrade}</td>
                <td style={{ fontWeight: 500 }}>{row.Grade}</td>

                {/* Renderiza as sugestões para cada filial */}
                {row.Filiais.map((filial) => (
                  <td key={filial.IdFilial}>
                    <input
                      type="number"
                      value={filial.totalqtd} // Agora pega o total correto de cada filial
                      onChange={(e) =>
                        handleSugestaoAlteradaChange(row.CodBarras, filial.IdFilial, e.target.value)
                      }
                      style={{ width: '35px' }}
                    />
                  </td>
                ))}

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};

//  preciso entender qual a diferença da logica do totalqtd retornoListaDistribuicaoCompras que está em javascript
// estou fazendo a mesma logica, em reactjs com os meus dados vindo mesmo banco, mais está mostrando resultados diferentes
// a diferença esta apenas na nomeação do respostaListaDistribuicaoCompras e dadosSugestoesHistorico

// no codigo javascript que esta em funcionamento os resultados são esses: e são corretotos estou tentando fazer este mesmo codigo em reactjs porém os mesmos produtos vindos do mesmo balanco
// estão retornando resultados diferentes no produto do final 38 o total 10 e o produto 16 o total 23 estão vindo desse jeito no reactjs
// nos produtos Calca L.2954 JEANS Mom Destroyed Escuro Focus 38 o total 10
// Calca L.2954 JEANS Mom Destroyed Escuro Focus 36, o total 13,

// estou enviando os códigos para que possam me ajudar a entender o que está acontecendo.