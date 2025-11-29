// Script para limpar Service Worker problemático
// Execute este código no console do navegador (F12)

console.log('🧹 Limpando Service Worker...');

// Desregistrar todos os Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log(`📋 Encontrados ${registrations.length} Service Workers`);
    
    registrations.forEach(function(registration) {
      console.log(`🗑️ Removendo Service Worker: ${registration.scope}`);
      registration.unregister().then(function(boolean) {
        if (boolean) {
          console.log(`✅ Service Worker removido com sucesso: ${registration.scope}`);
        } else {
          console.log(`❌ Falha ao remover Service Worker: ${registration.scope}`);
        }
      });
    });
  }).then(() => {
    console.log('🔄 Recarregando página...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}

// Limpar caches também
caches.keys().then(function(cacheNames) {
  console.log(`📦 Encontrados ${cacheNames.length} caches`);
  
  cacheNames.forEach(function(cacheName) {
    console.log(`🗑️ Removendo cache: ${cacheName}`);
    caches.delete(cacheName).then(function(boolean) {
      if (boolean) {
        console.log(`✅ Cache removido com sucesso: ${cacheName}`);
      } else {
        console.log(`❌ Falha ao remover cache: ${cacheName}`);
      }
    });
  });
});

console.log('✅ Limpeza concluída! A página será recarregada automaticamente.');