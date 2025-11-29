// Teste rápido do sistema de atualização automática
// Execute no console do navegador (F12)

console.log('🧪 Iniciando teste do sistema de atualização automática...');

// Função para simular lançamento de horas extras
function testAutoRefresh() {
  console.log('⏰ Teste iniciado às:', new Date().toLocaleTimeString('pt-BR'));
  
  // Monitorar atualizações
  let updateCount = 0;
  const originalLog = console.log;
  
  console.log = function(...args) {
    originalLog.apply(console, args);
    
    // Detectar atualizações automáticas
    if (args[0]?.includes?.('[AutoRefresh] ✅ Dados atualizados')) {
      updateCount++;
      console.log(`🔄 Atualização #${updateCount} detectada às ${new Date().toLocaleTimeString('pt-BR')}`);
    }
    
    if (args[0]?.includes?.('[PayrollEventView] ✅ Folha de pagamento atualizada')) {
      console.log('🎯 Sistema de folha de pagamento atualizado com sucesso!');
    }
  };
  
  console.log('✅ Monitoramento ativado. Aguardando atualizações automáticas...');
  console.log('💡 O sistema deve atualizar a cada 3 segundos automaticamente.');
  
  // Testar por 15 segundos
  setTimeout(() => {
    console.log(`📊 Teste concluído. Total de atualizações detectadas: ${updateCount}`);
    console.log('🎉 Se você viu atualizações, o sistema está funcionando perfeitamente!');
    console.log = originalLog;
  }, 15000);
}

// Iniciar teste
testAutoRefresh();

console.log('🔍 Observando o console para atualizações automáticas...');