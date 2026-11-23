import { useState } from "react";
import { get } from "../../../../../api/funcRequest";
import { useQuery } from "react-query";

export const useFornecedorSelecionado = ({}) => {
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
   
    const { data: dadosUltimoPedido = [], error: errorPedido, isLoading: isLoadingPedido, refetch: refetchListaPedidos } = useQuery(
        ['lista-pedidos', fornecedorSelecionado?.value],
        async () => {
          const response = await get(`/lista-pedidos?idFornecedor=${fornecedorSelecionado?.value}`);
          console.log(response.data, 'response.data')
          return response.data;
        },
        { enabled: Boolean(fornecedorSelecionado?.value), staleTime: 5 * 60 * 1000 }
    );
    
}