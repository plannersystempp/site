// VAPID Public Key para Push Notifications
// Esta chave pública é segura para estar no código do cliente
// 
// Para gerar suas chaves VAPID, execute:
// npx web-push generate-vapid-keys
// 
// Depois:
// 1. Adicione a chave pública aqui abaixo
// 2. Adicione a chave privada como secret VAPID_PRIVATE_KEY no Supabase

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Verificação de configuração
export const isVapidConfigured = () => {
  return VAPID_PUBLIC_KEY && VAPID_PUBLIC_KEY.length > 0;
};
