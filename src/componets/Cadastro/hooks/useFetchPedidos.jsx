import { useQuery } from 'react-query';
import { get } from '../../../api/funcRequest';
import { animacaoCarregamento, fecharAnimacaoCarregamento } from '../../../utils/animationCarregamento';



const fetchWithPagination = async (url, currentPage, pageSize) => {
  try {
    const response = await get(`${url}&page=${currentPage}`);
    if (response.data.length && response.data.length === pageSize) {
      let allData = [...response.data];
      animacaoCarregamento(`Carregando... Página ${currentPage} de ${response.data.length}`, true);

      async function fetchNextPage(currentPage) {
        try {
          currentPage++;
          const responseNextPage = await get(`${url}&page=${currentPage}`);
          if (responseNextPage.data.length) {
            allData.push(...responseNextPage.data);
            return fetchNextPage(currentPage);
          } else {
            return allData;
          }
        } catch (error) {
          console.error('Erro ao buscar próxima página:', error);
          throw error;
        }
      }

      await fetchNextPage(currentPage);
      return allData;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  } finally {
    fecharAnimacaoCarregamento();
  }
};

export const useFetchWithPagination = (key, url, currentPage, pageSize, enabled) => {
  return useQuery(
    [key, url, currentPage, pageSize],
    () => fetchWithPagination(url, currentPage, pageSize),
    {
      enabled,
    }
  );
};



