import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoStats {
  personnel: number;
  events: number;
  allocations: number;
  divisions: number;
  suppliers: number;
  supplier_items: number;
  event_costs: number;
  personnel_payments: number;
  ratings: number;
  absences: number;
  payroll_closings: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verificar se é superadmin
    console.log('🔐 Verificando autorização...');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing authorization header');
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError) {
      console.error('❌ Error getting user:', userError.message);
      throw new Error('Unauthorized: ' + userError.message);
    }
    
    if (!user) {
      console.error('❌ No user found from token');
      throw new Error('Unauthorized: No user found');
    }

    console.log(`✅ User found: ${user.email} (${user.id})`);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError.message);
      throw new Error('Error fetching user profile: ' + profileError.message);
    }

    if (!profile) {
      console.error('❌ No profile found for user:', user.id);
      throw new Error('User profile not found');
    }

    console.log(`👤 User role: ${profile.role}`);

    if (profile.role !== 'superadmin') {
      console.error('❌ User is not superadmin. Role:', profile.role);
      throw new Error('Only superadmins can create demo accounts');
    }

    console.log('✅ Superadmin verified!');

    console.log('🚀 Iniciando criação de conta demo...');

    // Constantes da conta demo
    const DEMO_EMAIL = 'euquero@plannersystem.com.br';
    const DEMO_PASSWORD = 'EuQuero@2025';
    const DEMO_TEAM_NAME = 'DEMO - Sistema Completo SIGE';
    const DEMO_CNPJ = '12.345.678/0001-90';

    // 1. Deletar conta demo anterior se existir
    console.log('🗑️ Removendo conta demo anterior (dados completos)...');
    
    // Buscar equipe demo existente
    const { data: oldTeams } = await supabaseAdmin
      .from('teams')
      .select('id')
      .or(`name.eq.${DEMO_TEAM_NAME},cnpj.eq.${DEMO_CNPJ}`);
    
    if (oldTeams && oldTeams.length > 0) {
      console.log(`🗑️ Encontradas ${oldTeams.length} equipe(s) demo antigas. Deletando...`);
      for (const team of oldTeams) {
        // Deletar manualmente dados relacionados para garantir limpeza
        await supabaseAdmin.from('personnel_payments').delete().eq('team_id', team.id);
        await supabaseAdmin.from('payroll_closings').delete().eq('team_id', team.id);
        await supabaseAdmin.from('absences').delete().eq('team_id', team.id);
        await supabaseAdmin.from('freelancer_ratings').delete().eq('team_id', team.id);
        await supabaseAdmin.from('event_supplier_costs').delete().eq('team_id', team.id);
        await supabaseAdmin.from('personnel_allocations').delete().eq('team_id', team.id);
        await supabaseAdmin.from('event_divisions').delete().eq('team_id', team.id);
        await supabaseAdmin.from('events').delete().eq('team_id', team.id);
        await supabaseAdmin.from('supplier_items').delete().in('supplier_id', 
          (await supabaseAdmin.from('suppliers').select('id').eq('team_id', team.id)).data?.map(s => s.id) || []
        );
        await supabaseAdmin.from('suppliers').delete().eq('team_id', team.id);
        await supabaseAdmin.from('personnel_functions').delete().eq('team_id', team.id);
        await supabaseAdmin.from('personnel').delete().eq('team_id', team.id);
        await supabaseAdmin.from('functions').delete().eq('team_id', team.id);
        await supabaseAdmin.from('team_subscriptions').delete().eq('team_id', team.id);
        await supabaseAdmin.from('team_members').delete().eq('team_id', team.id);
        await supabaseAdmin.from('teams').delete().eq('id', team.id);
      }
      console.log('✅ Dados da conta demo anterior deletados completamente');
    }
    
    // Não deletamos o usuário demo; reutilizaremos se já existir
    // 2. Criar usuário demo
    console.log('👤 Criando usuário demo...');
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'Conta Demonstração',
        demo_account: true
      }
    });

    let demoUserId: string | null = null;

    if (createUserError || !newUser?.user) {
      const msg = createUserError?.message?.toLowerCase() || '';
      if (msg.includes('already') || msg.includes('registered')) {
        console.log('ℹ️ Usuário demo já existe, reutilizando e atualizando senha...');
        // Procurar usuário existente por páginas
        let foundUserId: string | null = null;
        for (let page = 1; page <= 10; page++) {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
          const found = list?.users?.find((u: any) => u.email === DEMO_EMAIL);
          if (found) { foundUserId = found.id; break; }
          if (!list || list.users.length < 200) break;
        }
        if (!foundUserId) {
          throw new Error('Demo user exists but could not be retrieved');
        }
        // Atualiza senha e metadados para garantir acesso
        await supabaseAdmin.auth.admin.updateUserById(foundUserId, {
          password: DEMO_PASSWORD,
          user_metadata: { name: 'Conta Demonstração', demo_account: true }
        });
        demoUserId = foundUserId;
      } else {
        throw new Error(`Failed to create demo user: ${createUserError?.message}`);
      }
    } else {
      demoUserId = newUser.user.id;
    }

    // 3. Garantir perfil do usuário (upsert)
    await supabaseAdmin.from('user_profiles').upsert({
      user_id: demoUserId!,
      email: DEMO_EMAIL,
      name: 'Conta Demonstração',
      role: 'admin',
      is_approved: true
    }, { onConflict: 'user_id' });

    // 4. Criar equipe demo (sempre nova após limpeza)
    console.log('🏢 Criando nova equipe demo...');
    const invite = `DEMO${Date.now().toString().slice(-5)}`;
    const { data: newTeam, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert({
        name: DEMO_TEAM_NAME,
        cnpj: DEMO_CNPJ,
        owner_id: demoUserId,
        invite_code: invite,
        is_system: true
      })
      .select()
      .single();

    if (teamError || !newTeam) {
      throw new Error(`Failed to create team: ${teamError?.message}`);
    }
    
    const teamRow = newTeam;

    const teamId = teamRow.id;

    // 5. Adicionar usuário como admin da equipe (idempotente)
    await supabaseAdmin.from('team_members').upsert({
      team_id: teamId,
      user_id: demoUserId,
      role: 'admin',
      status: 'approved'
    }, { onConflict: 'team_id,user_id' });

    // 6. Criar assinatura Enterprise permanente (upsert para evitar duplicação)
    console.log('💎 Criando/Atualizando assinatura Enterprise...');
    const { data: enterprisePlan } = await supabaseAdmin
      .from('subscription_plans')
      .select('id')
      .eq('name', 'enterprise')
      .single();

    if (enterprisePlan) {
      const { error: subError } = await supabaseAdmin
        .from('team_subscriptions')
        .upsert({
          team_id: teamId,
          plan_id: enterprisePlan.id,
          status: 'active',
          current_period_starts_at: new Date().toISOString(),
          current_period_ends_at: '2099-12-31T23:59:59Z',
          trial_ends_at: null
        }, { 
          onConflict: 'team_id',
          ignoreDuplicates: false 
        });
      
      if (subError) {
        console.error('⚠️ Erro ao criar assinatura:', subError.message);
      } else {
        console.log('✅ Assinatura Enterprise criada/atualizada');
      }
    }

    // 7. Popular com dados (funções já são criadas via trigger)
    const stats: DemoStats = {
      personnel: 0,
      events: 0,
      allocations: 0,
      divisions: 0,
      suppliers: 0,
      supplier_items: 0,
      event_costs: 0,
      personnel_payments: 0,
      ratings: 0,
      absences: 0,
      payroll_closings: 0
    };

    // Obter funções criadas automaticamente
    const { data: functions } = await supabaseAdmin
      .from('functions')
      .select('id, name')
      .eq('team_id', teamId);

    // POPULAR PESSOAL (30 pessoas)
    console.log('👥 Criando pessoal...');
    const personnelData = [
      // Fixos
      { name: 'Carlos Silva', type: 'fixo', email: 'carlos@demo.com', phone: '(11) 98765-4321', monthly_salary: 4500, event_cache: 300, overtime_rate: 75, shirt_size: 'M' },
      { name: 'Ana Santos', type: 'fixo', email: 'ana@demo.com', phone: '(11) 98765-4322', monthly_salary: 4000, event_cache: 250, overtime_rate: 60, shirt_size: 'P' },
      { name: 'Roberto Lima', type: 'fixo', email: 'roberto@demo.com', phone: '(11) 98765-4323', monthly_salary: 5000, event_cache: 350, overtime_rate: 80, shirt_size: 'G' },
      { name: 'Mariana Costa', type: 'fixo', email: 'mariana@demo.com', phone: '(11) 98765-4324', monthly_salary: 3800, event_cache: 200, overtime_rate: 55, shirt_size: 'M' },
      { name: 'Pedro Oliveira', type: 'fixo', email: 'pedro@demo.com', phone: '(11) 98765-4325', monthly_salary: 4200, event_cache: 280, overtime_rate: 65, shirt_size: 'GG' },
      { name: 'Juliana Souza', type: 'fixo', email: 'juliana@demo.com', phone: '(11) 98765-4326', monthly_salary: 3500, event_cache: 180, overtime_rate: 50, shirt_size: 'P' },
      { name: 'Fernando Alves', type: 'fixo', email: 'fernando@demo.com', phone: '(11) 98765-4327', monthly_salary: 4800, event_cache: 320, overtime_rate: 75, shirt_size: 'M' },
      { name: 'Camila Rocha', type: 'fixo', email: 'camila@demo.com', phone: '(11) 98765-4328', monthly_salary: 3900, event_cache: 220, overtime_rate: 58, shirt_size: 'M' },
      { name: 'Ricardo Mendes', type: 'fixo', email: 'ricardo@demo.com', phone: '(11) 98765-4329', monthly_salary: 5200, event_cache: 380, overtime_rate: 85, shirt_size: 'G' },
      { name: 'Patricia Ferreira', type: 'fixo', email: 'patricia@demo.com', phone: '(11) 98765-4330', monthly_salary: 3700, event_cache: 190, overtime_rate: 52, shirt_size: 'P' },
      { name: 'Lucas Barbosa', type: 'fixo', email: 'lucas@demo.com', phone: '(11) 98765-4331', monthly_salary: 4100, event_cache: 270, overtime_rate: 63, shirt_size: 'M' },
      { name: 'Amanda Dias', type: 'fixo', email: 'amanda@demo.com', phone: '(11) 98765-4332', monthly_salary: 3600, event_cache: 185, overtime_rate: 51, shirt_size: 'P' },
      { name: 'Thiago Martins', type: 'fixo', email: 'thiago@demo.com', phone: '(11) 98765-4333', monthly_salary: 4700, event_cache: 310, overtime_rate: 72, shirt_size: 'G' },
      { name: 'Beatriz Cardoso', type: 'fixo', email: 'beatriz@demo.com', phone: '(11) 98765-4334', monthly_salary: 3800, event_cache: 205, overtime_rate: 56, shirt_size: 'M' },
      { name: 'Gustavo Pereira', type: 'fixo', email: 'gustavo@demo.com', phone: '(11) 98765-4335', monthly_salary: 5100, event_cache: 370, overtime_rate: 82, shirt_size: 'GG' },
      // Freelancers
      { name: 'Rafael Moreira', type: 'freelancer', phone: '(11) 99876-5401', event_cache: 400, overtime_rate: 90, shirt_size: 'M' },
      { name: 'Larissa Cunha', type: 'freelancer', phone: '(11) 99876-5402', event_cache: 350, overtime_rate: 80, shirt_size: 'P' },
      { name: 'Bruno Teixeira', type: 'freelancer', phone: '(11) 99876-5403', event_cache: 450, overtime_rate: 95, shirt_size: 'G' },
      { name: 'Fernanda Reis', type: 'freelancer', phone: '(11) 99876-5404', event_cache: 380, overtime_rate: 85, shirt_size: 'M' },
      { name: 'Daniel Araujo', type: 'freelancer', phone: '(11) 99876-5405', event_cache: 420, overtime_rate: 88, shirt_size: 'M' },
      { name: 'Carla Nascimento', type: 'freelancer', phone: '(11) 99876-5406', event_cache: 360, overtime_rate: 78, shirt_size: 'P' },
      { name: 'Marcos Ribeiro', type: 'freelancer', phone: '(11) 99876-5407', event_cache: 410, overtime_rate: 87, shirt_size: 'G' },
      { name: 'Aline Gomes', type: 'freelancer', phone: '(11) 99876-5408', event_cache: 340, overtime_rate: 75, shirt_size: 'M' },
      { name: 'Felipe Castro', type: 'freelancer', phone: '(11) 99876-5409', event_cache: 430, overtime_rate: 92, shirt_size: 'GG' },
      { name: 'Natalia Vieira', type: 'freelancer', phone: '(11) 99876-5410', event_cache: 370, overtime_rate: 82, shirt_size: 'P' },
      { name: 'Diego Monteiro', type: 'freelancer', phone: '(11) 99876-5411', event_cache: 390, overtime_rate: 84, shirt_size: 'M' },
      { name: 'Renata Lopes', type: 'freelancer', phone: '(11) 99876-5412', event_cache: 355, overtime_rate: 76, shirt_size: 'M' },
      { name: 'Vinicius Machado', type: 'freelancer', phone: '(11) 99876-5413', event_cache: 440, overtime_rate: 94, shirt_size: 'G' },
      { name: 'Priscila Correia', type: 'freelancer', phone: '(11) 99876-5414', event_cache: 365, overtime_rate: 79, shirt_size: 'P' },
      { name: 'Rodrigo Farias', type: 'freelancer', phone: '(11) 99876-5415', event_cache: 425, overtime_rate: 89, shirt_size: 'M' }
    ];

    const { data: createdPersonnel } = await supabaseAdmin
      .from('personnel')
      .insert(personnelData.map(p => ({ ...p, team_id: teamId })))
      .select();

    stats.personnel = createdPersonnel?.length || 0;

    // Associar funções ao pessoal
    if (createdPersonnel && functions) {
      const personnelFunctions = createdPersonnel.map((person, idx) => ({
        personnel_id: person.id,
        function_id: functions[idx % functions.length]?.id,
        team_id: teamId,
        is_primary: true
      }));
      await supabaseAdmin.from('personnel_functions').insert(personnelFunctions);
    }

    // POPULAR FORNECEDORES (15 fornecedores)
    console.log('🏭 Criando fornecedores...');
    const suppliersData = [
      { name: 'Som & Luz Eventos', legal_name: 'Som & Luz Eventos Ltda', cnpj: '11.222.333/0001-44', phone: '(11) 3333-4444', email: 'contato@someluzeventos.com', contact_person: 'João Silva' },
      { name: 'Estruturas Premium', legal_name: 'Estruturas Premium ME', cnpj: '22.333.444/0001-55', phone: '(11) 3333-5555', email: 'comercial@estruturaspremium.com', contact_person: 'Maria Santos' },
      { name: 'Buffet Gourmet', legal_name: 'Buffet Gourmet Eireli', cnpj: '33.444.555/0001-66', phone: '(11) 3333-6666', email: 'vendas@buffetgourmet.com', contact_person: 'Carlos Mendes' },
      { name: 'Translog Eventos', legal_name: 'Translog Transportes Ltda', cnpj: '44.555.666/0001-77', phone: '(11) 3333-7777', email: 'logistica@translogeventos.com', contact_person: 'Ana Costa' },
      { name: 'LightShow Pro', legal_name: 'LightShow Iluminação Profissional', cnpj: '55.666.777/0001-88', phone: '(11) 3333-8888', email: 'contato@lightshowpro.com', contact_person: 'Pedro Luz' },
      { name: 'AudioMaster', legal_name: 'AudioMaster Equipamentos Ltda', cnpj: '66.777.888/0001-99', phone: '(11) 3333-9999', email: 'som@audiomaster.com', contact_person: 'Ricardo Som' },
      { name: 'Segurança Total', legal_name: 'Segurança Total Vigilância', cnpj: '77.888.999/0001-00', phone: '(11) 3333-0000', email: 'operacoes@segurancatotal.com', contact_person: 'Marcos Silva' },
      { name: 'Clean Eventos', legal_name: 'Clean Eventos Limpeza', cnpj: '88.999.000/0001-11', phone: '(11) 3333-1111', email: 'comercial@cleaneventos.com', contact_person: 'Patricia Lima' },
      { name: 'Energia Solutions', legal_name: 'Energia Solutions Geradores', cnpj: '99.000.111/0001-22', phone: '(11) 3333-2222', email: 'geradores@energiasolutions.com', contact_person: 'Fernando Volt' },
      { name: 'Deco Festas', legal_name: 'Deco Festas Decorações', cnpj: '00.111.222/0001-33', phone: '(11) 3333-3333', email: 'deco@decofestas.com', contact_person: 'Camila Decor' },
      { name: 'Bebidas & Cia', legal_name: 'Bebidas & Cia Distribuidora', cnpj: '11.222.333/0001-44', phone: '(11) 3333-4445', email: 'vendas@bebidasecia.com', contact_person: 'Roberto Drinks' },
      { name: 'Palco Show', legal_name: 'Palco Show Estruturas', cnpj: '22.333.444/0001-55', phone: '(11) 3333-5556', email: 'palcos@palcoshow.com', contact_person: 'Juliana Stage' },
      { name: 'VideoTec Pro', legal_name: 'VideoTec Projeções Ltda', cnpj: '33.444.555/0001-66', phone: '(11) 3333-6667', email: 'video@videotecpro.com', contact_person: 'Thiago Video' },
      { name: 'Mobília Eventos', legal_name: 'Mobília Eventos Locações', cnpj: '44.555.666/0001-77', phone: '(11) 3333-7778', email: 'locacao@mobiliaevento.com', contact_person: 'Beatriz Móveis' },
      { name: 'Gerador Express', legal_name: 'Gerador Express Ltda', cnpj: '55.666.777/0001-88', phone: '(11) 3333-8889', email: 'contato@geradorexpress.com', contact_person: 'Gustavo Power' }
    ];

    const { data: createdSuppliers } = await supabaseAdmin
      .from('suppliers')
      .insert(suppliersData.map(s => ({ ...s, team_id: teamId })))
      .select();

    stats.suppliers = createdSuppliers?.length || 0;

    // Criar itens de fornecedores
    if (createdSuppliers) {
      const supplierItemsData = [];
      for (const supplier of createdSuppliers) {
        if (supplier.name.includes('Som')) {
          supplierItemsData.push(
            { supplier_id: supplier.id, item_name: 'Mesa de Som 32 Canais', price: 800, unit: 'diária' },
            { supplier_id: supplier.id, item_name: 'Caixa de Som Line Array', price: 500, unit: 'unidade/dia' },
            { supplier_id: supplier.id, item_name: 'Microfone sem Fio', price: 100, unit: 'unidade/dia' }
          );
        } else if (supplier.name.includes('Estruturas') || supplier.name.includes('Palco')) {
          supplierItemsData.push(
            { supplier_id: supplier.id, item_name: 'Palco 8x6m', price: 1500, unit: 'unidade' },
            { supplier_id: supplier.id, item_name: 'Tenda 10x10m', price: 1200, unit: 'unidade' },
            { supplier_id: supplier.id, item_name: 'Cadeira Plástica', price: 5, unit: 'unidade/dia' }
          );
        } else if (supplier.name.includes('Buffet') || supplier.name.includes('Bebidas')) {
          supplierItemsData.push(
            { supplier_id: supplier.id, item_name: 'Coquetel Executivo', price: 45, unit: 'pessoa' },
            { supplier_id: supplier.id, item_name: 'Bebidas Variadas', price: 25, unit: 'pessoa' },
            { supplier_id: supplier.id, item_name: 'Coffee Break Completo', price: 30, unit: 'pessoa' }
          );
        }
      }
      const { data: items } = await supabaseAdmin.from('supplier_items').insert(supplierItemsData).select();
      stats.supplier_items = items?.length || 0;
    }

    // POPULAR EVENTOS (25 eventos)
    console.log('📅 Criando eventos...');
    const now = new Date();
    const eventsData = [
      // Eventos passados concluídos (5)
      { name: 'Show Rock Festival 2024', description: 'Festival de rock com 3 bandas', start_date: '2024-11-15', end_date: '2024-11-15', status: 'concluido', event_revenue: 85000 },
      { name: 'Casamento Maria & João', description: 'Cerimônia e festa', start_date: '2024-11-20', end_date: '2024-11-20', status: 'concluido', event_revenue: 45000 },
      { name: 'Conferência Tech Summit', description: 'Conferência de tecnologia', start_date: '2024-11-25', end_date: '2024-11-27', status: 'concluido', event_revenue: 120000 },
      { name: 'Festa de Formatura Medicina', description: 'Formatura turma 2024', start_date: '2024-12-01', end_date: '2024-12-01', status: 'concluido', event_revenue: 65000 },
      { name: 'Show Sertanejo Dupla XYZ', description: 'Show em casa de eventos', start_date: '2024-12-05', end_date: '2024-12-05', status: 'concluido', event_revenue: 55000 },
      
      // Eventos em andamento (5)
      { name: 'Feira de Negócios 2025', description: 'Feira comercial', start_date: new Date(now.getTime() - 2*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 1*24*60*60*1000).toISOString().split('T')[0], status: 'em_andamento', event_revenue: 95000 },
      { name: 'Workshop de Liderança', description: 'Treinamento corporativo', start_date: new Date(now.getTime() - 1*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 2*24*60*60*1000).toISOString().split('T')[0], status: 'em_andamento', event_revenue: 35000 },
      { name: 'Festival Gastronômico', description: 'Festival de comida', start_date: now.toISOString().split('T')[0], end_date: new Date(now.getTime() + 3*24*60*60*1000).toISOString().split('T')[0], status: 'em_andamento', event_revenue: 72000 },
      { name: 'Show Eletrônico DJ Set', description: 'Festa eletrônica', start_date: new Date(now.getTime() - 1*24*60*60*1000).toISOString().split('T')[0], end_date: now.toISOString().split('T')[0], status: 'em_andamento', event_revenue: 48000 },
      { name: 'Convenção Empresarial', description: 'Convenção anual', start_date: now.toISOString().split('T')[0], end_date: new Date(now.getTime() + 2*24*60*60*1000).toISOString().split('T')[0], status: 'em_andamento', event_revenue: 110000 },
      
      // Eventos futuros (15)
      { name: 'Casamento Ana & Carlos', description: 'Casamento ao ar livre', start_date: new Date(now.getTime() + 7*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 7*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 52000 },
      { name: 'Show MPB Cantor Famoso', description: 'Show acústico', start_date: new Date(now.getTime() + 10*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 10*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 78000 },
      { name: 'Lançamento de Produto', description: 'Evento corporativo', start_date: new Date(now.getTime() + 14*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 14*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 42000 },
      { name: 'Aniversário Empresa 20 Anos', description: 'Comemoração corporativa', start_date: new Date(now.getTime() + 21*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 21*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 68000 },
      { name: 'Festival de Inverno', description: 'Festival cultural', start_date: new Date(now.getTime() + 30*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 32*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 135000 },
      { name: 'Feira de Artesanato', description: 'Feira de artesãos', start_date: new Date(now.getTime() + 35*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 37*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 28000 },
      { name: 'Baile de Gala Beneficente', description: 'Evento social', start_date: new Date(now.getTime() + 42*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 42*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 95000 },
      { name: 'Seminário de Vendas', description: 'Treinamento comercial', start_date: new Date(now.getTime() + 45*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 46*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 38000 },
      { name: 'Show Stand Up Comedy', description: 'Noite de comédia', start_date: new Date(now.getTime() + 49*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 49*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 32000 },
      { name: 'Exposição de Arte', description: 'Vernissage', start_date: new Date(now.getTime() + 56*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 58*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 25000 },
      { name: 'Corrida Beneficente 10K', description: 'Corrida de rua', start_date: new Date(now.getTime() + 60*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 60*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 45000 },
      { name: 'Festival de Música Indie', description: 'Festival alternativo', start_date: new Date(now.getTime() + 70*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 72*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 88000 },
      { name: 'Palestra Motivacional', description: 'Evento inspiracional', start_date: new Date(now.getTime() + 77*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 77*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 22000 },
      { name: 'Jantar Dançante Premium', description: 'Evento social exclusivo', start_date: new Date(now.getTime() + 84*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 84*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 75000 },
      { name: 'Workshop de Fotografia', description: 'Curso intensivo', start_date: new Date(now.getTime() + 90*24*60*60*1000).toISOString().split('T')[0], end_date: new Date(now.getTime() + 92*24*60*60*1000).toISOString().split('T')[0], status: 'planejado', event_revenue: 18000 }
    ];

    const { data: createdEvents } = await supabaseAdmin
      .from('events')
      .insert(eventsData.map(e => ({ ...e, team_id: teamId })))
      .select();

    stats.events = createdEvents?.length || 0;

    // Criar divisões e alocações para cada evento
    if (createdEvents && createdPersonnel) {
      console.log('🎯 Criando divisões e alocações...');
      
      for (const event of createdEvents) {
        // Criar 3-4 divisões por evento
        const divisionsData = [
          { event_id: event.id, team_id: teamId, name: 'Equipe Técnica', description: 'Som, luz e vídeo' },
          { event_id: event.id, team_id: teamId, name: 'Equipe de Montagem', description: 'Estrutura e palco' },
          { event_id: event.id, team_id: teamId, name: 'Equipe de Atendimento', description: 'Recepção e público' }
        ];

        const { data: divisions } = await supabaseAdmin
          .from('event_divisions')
          .insert(divisionsData)
          .select();

        if (divisions) {
          stats.divisions += divisions.length;

          // Alocar 6-10 pessoas por evento
          const numAllocations = 6 + Math.floor(Math.random() * 5);
          const selectedPeople = createdPersonnel
            .sort(() => Math.random() - 0.5)
            .slice(0, numAllocations);

          const allocationsData = selectedPeople.map((person, idx) => {
            const division = divisions[idx % divisions.length];
            const func = functions?.[Math.floor(Math.random() * functions.length)];
            
            // Gerar dias de trabalho baseado nas datas do evento
            const workDays = [];
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              workDays.push(d.toISOString().split('T')[0]);
            }

            return {
              team_id: teamId,
              event_id: event.id,
              division_id: division.id,
              personnel_id: person.id,
              function_name: func?.name || 'Assistente Geral',
              work_days: workDays
            };
          });

          const { data: allocations } = await supabaseAdmin
            .from('personnel_allocations')
            .insert(allocationsData)
            .select();

          if (allocations) {
            stats.allocations += allocations.length;
          }
        }
      }
    }

    // Criar custos de eventos
    if (createdEvents && createdSuppliers) {
      console.log('💰 Criando custos de eventos...');
      
      for (const event of createdEvents.slice(0, 15)) { // Custos para 15 eventos
        const numCosts = 3 + Math.floor(Math.random() * 5);
        const selectedSuppliers = createdSuppliers
          .sort(() => Math.random() - 0.5)
          .slice(0, numCosts);

        const costsData = selectedSuppliers.map(supplier => {
          const unitPrice = 500 + Math.random() * 4500;
          const quantity = 1 + Math.floor(Math.random() * 5);
          const totalAmount = unitPrice * quantity;
          const isPaid = Math.random() > 0.3;
          const paidAmount = isPaid ? totalAmount : (Math.random() > 0.5 ? totalAmount * 0.5 : 0);

          return {
            team_id: teamId,
            event_id: event.id,
            supplier_id: supplier.id,
            supplier_name: supplier.name,
            description: `Serviço/Equipamento - ${supplier.name}`,
            category: 'Equipamentos',
            unit_price: unitPrice,
            quantity: quantity,
            total_amount: totalAmount,
            paid_amount: paidAmount,
            payment_status: paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partially_paid' : 'pending'),
            payment_date: isPaid ? event.start_date : null
          };
        });

        const { data: costs } = await supabaseAdmin
          .from('event_supplier_costs')
          .insert(costsData)
          .select();

        if (costs) {
          stats.event_costs += costs.length;
        }
      }
    }

    // Criar pagamentos avulsos de pessoal
    if (createdPersonnel) {
      console.log('💵 Criando pagamentos avulsos...');
      
      const paymentsData = [];
      for (let i = 0; i < 20; i++) {
        const person = createdPersonnel[Math.floor(Math.random() * createdPersonnel.length)];
        const amount = 500 + Math.random() * 2000;
        const dueDate = new Date(now.getTime() + (Math.random() - 0.5) * 30*24*60*60*1000);
        const isPaid = Math.random() > 0.3;

        paymentsData.push({
          team_id: teamId,
          personnel_id: person.id,
          amount: amount,
          payment_due_date: dueDate.toISOString().split('T')[0],
          payment_status: isPaid ? 'paid' : 'pending',
          description: 'Pagamento Extra - ' + (['Hora Extra', 'Bônus', 'Adiantamento'][Math.floor(Math.random() * 3)]),
          paid_at: isPaid ? dueDate.toISOString() : null,
          paid_by_id: isPaid ? demoUserId : null
        });
      }

      const { data: payments } = await supabaseAdmin
        .from('personnel_payments')
        .insert(paymentsData)
        .select();

      stats.personnel_payments = payments?.length || 0;
    }

    // Criar avaliações de freelancers
    if (createdPersonnel && createdEvents) {
      console.log('⭐ Criando avaliações...');
      
      const freelancers = createdPersonnel.filter(p => p.type === 'freelancer');
      const ratingsData = [];

      for (const freelancer of freelancers.slice(0, 10)) {
        const numRatings = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numRatings; i++) {
          const event = createdEvents[Math.floor(Math.random() * Math.min(10, createdEvents.length))];
          ratingsData.push({
            team_id: teamId,
            event_id: event.id,
            freelancer_id: freelancer.id,
            rated_by_id: demoUserId,
            rating: 3 + Math.floor(Math.random() * 3) // 3-5 estrelas
          });
        }
      }

      const { data: ratings } = await supabaseAdmin
        .from('freelancer_ratings')
        .insert(ratingsData)
        .select();

      stats.ratings = ratings?.length || 0;
    }

    // Criar ausências
    if (createdEvents && createdPersonnel) {
      console.log('📋 Criando ausências...');
      
      const { data: allocations } = await supabaseAdmin
        .from('personnel_allocations')
        .select('*')
        .eq('team_id', teamId)
        .limit(50);

      if (allocations) {
        const absencesData = [];
        for (let i = 0; i < 12; i++) {
          const allocation = allocations[Math.floor(Math.random() * allocations.length)];
          if (allocation.work_days && allocation.work_days.length > 0) {
            const workDate = allocation.work_days[Math.floor(Math.random() * allocation.work_days.length)];
            absencesData.push({
              team_id: teamId,
              assignment_id: allocation.id,
              work_date: workDate,
              logged_by_id: demoUserId,
              notes: 'Falta registrada - ' + (['Doença', 'Imprevisto', 'Outro compromisso'][Math.floor(Math.random() * 3)])
            });
          }
        }

        const { data: absences } = await supabaseAdmin
          .from('absences')
          .insert(absencesData)
          .select();

        stats.absences = absences?.length || 0;
      }
    }

    // Criar fechamentos de folha para eventos concluídos
    if (createdEvents && createdPersonnel) {
      console.log('📊 Criando fechamentos de folha...');
      
      const completedEvents = createdEvents.filter(e => e.status === 'concluido');
      const closingsData = [];

      for (const event of completedEvents) {
        const { data: eventAllocations } = await supabaseAdmin
          .from('personnel_allocations')
          .select('*')
          .eq('event_id', event.id);

        if (eventAllocations) {
          for (const allocation of eventAllocations.slice(0, 5)) { // Fechar 5 primeiras pessoas
            const person = createdPersonnel.find(p => p.id === allocation.personnel_id);
            if (person) {
              const totalAmount = person.event_cache * allocation.work_days.length;
              closingsData.push({
                team_id: teamId,
                event_id: event.id,
                personnel_id: person.id,
                total_amount_paid: totalAmount,
                paid_by_id: demoUserId,
                notes: 'Fechamento automático - demo'
              });
            }
          }
        }
      }

      const { data: closings } = await supabaseAdmin
        .from('payroll_closings')
        .insert(closingsData)
        .select();

      stats.payroll_closings = closings?.length || 0;
    }

    console.log('✅ Conta demo criada com sucesso!');
    console.log('📊 Estatísticas:', stats);

    // Calcular totais financeiros
    const { data: totalCosts } = await supabaseAdmin
      .from('event_supplier_costs')
      .select('total_amount')
      .eq('team_id', teamId);

    const totalCostsValue = totalCosts?.reduce((sum, c) => sum + Number(c.total_amount), 0) || 0;

    const { data: totalRevenue } = await supabaseAdmin
      .from('events')
      .select('event_revenue')
      .eq('team_id', teamId);

    const totalRevenueValue = totalRevenue?.reduce((sum, e) => sum + Number(e.event_revenue), 0) || 0;

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD
        },
        team: {
          id: teamId,
          name: DEMO_TEAM_NAME,
          invite_code: 'DEMO2024'
        },
        statistics: stats,
        financial_summary: {
          total_revenue: totalRevenueValue,
          total_costs: totalCostsValue,
          net_profit: totalRevenueValue - totalCostsValue
        },
        quick_facts: [
          `${stats.events} eventos cadastrados`,
          `${stats.personnel} profissionais (${personnelData.filter(p => p.type === 'fixo').length} fixos + ${personnelData.filter(p => p.type === 'freelancer').length} freelancers)`,
          `${stats.allocations} alocações realizadas`,
          `${stats.suppliers} fornecedores parceiros`,
          `R$ ${totalRevenueValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em receita total`,
          `${stats.payroll_closings} fechamentos de folha`,
          `${stats.personnel_payments} pagamentos avulsos`,
          `Assinatura Enterprise válida até 2099`
        ],
        access_link: `${Deno.env.get('SUPABASE_URL')?.replace('https://atogozlqfwxztjyycjoy.supabase.co', 'https://app.url.com')}/login`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('❌ Erro ao criar conta demo:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao criar conta demo',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
