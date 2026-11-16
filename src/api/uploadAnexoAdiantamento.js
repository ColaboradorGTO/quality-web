import { upload } from '@vercel/blob/client';
import { BASE_URL } from './api';

export const TIPOS_ANEXO_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const TAMANHO_MAXIMO_ANEXO_MB = 10;

export class ErroAnexo extends Error {}

// Envia o arquivo direto do navegador para o Vercel Blob.
// A API só gera o token (/upload-anexo-adiantamento/token), então o arquivo
// não passa pela função e não esbarra no limite de 4,5 MB da Vercel.
// Retorna o pathname do blob, no mesmo formato que a rota antiga devolvia.
export async function enviarAnexoAdiantamento(arquivo) {
  if (!TIPOS_ANEXO_PERMITIDOS.includes(arquivo.type)) {
    throw new ErroAnexo('Arquivo inválido. Envie apenas PDF ou imagem (JPEG, PNG, WEBP).');
  }

  if (arquivo.size > TAMANHO_MAXIMO_ANEXO_MB * 1024 * 1024) {
    throw new ErroAnexo(`Arquivo muito grande. O tamanho máximo é ${TAMANHO_MAXIMO_ANEXO_MB} MB.`);
  }

  const nomeSanitizado = arquivo.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const token = localStorage.getItem('token');

  const blob = await upload(`adiantamentos/${Date.now()}-${nomeSanitizado}`, arquivo, {
    access: 'private',
    contentType: arquivo.type,
    handleUploadUrl: `${BASE_URL}/upload-anexo-adiantamento/token`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return blob.pathname;
}
