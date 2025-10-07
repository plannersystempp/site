import { supabase } from '@/integrations/supabase/client';
import type { Event, Personnel, EventFunction, EventAssignment, Division, WorkLog } from './types';

export class DataFetcher {
  static async fetchAllData(teamId: string) {
    console.log('Fetching data for team:', teamId);
    
    try {
      const [
        eventsData,
        personnelData,
        functionsData,
        assignmentsData,
        divisionsData,
        workLogsData
      ] = await Promise.all([
        this.fetchEvents(teamId),
        this.fetchPersonnel(teamId),
        this.fetchFunctions(teamId),
        this.fetchAssignments(teamId),
        this.fetchDivisions(teamId),
        this.fetchWorkLogs(teamId)
      ]);

      console.log('Data fetched successfully:', {
        events: eventsData.length,
        personnel: personnelData.length,
        functions: functionsData.length,
        assignments: assignmentsData.length,
        divisions: divisionsData.length,
        workLogs: workLogsData.length
      });

      return {
        events: eventsData,
        personnel: personnelData,
        functions: functionsData,
        assignments: assignmentsData,
        divisions: divisionsData,
        workLogs: workLogsData
      };
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw error;
    }
  }

  static async fetchEvents(teamId: string): Promise<Event[]> {
    console.log('Fetching events...');
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    console.log('Events fetched:', data?.length || 0);
    return (data || []).map(event => ({
      ...event,
      status: event.status as Event['status'] || 'planejado'
    }));
  }

  static async fetchPersonnel(teamId: string): Promise<Personnel[]> {
    console.log('Fetching personnel...');
    
    // Import the personnel service to handle role-based data fetching
    const { fetchPersonnelByRole } = await import('@/services/personnelService');
    
    try {
      const personnelData = await fetchPersonnelByRole(teamId);
      console.log('Personnel fetched:', personnelData?.length || 0);
      
      // Type assertion needed since we might get redacted data for coordinators
      // but the context expects full Personnel[] type
      return personnelData as Personnel[];
    } catch (error) {
      console.error('Error fetching personnel:', error);
      throw error;
    }
  }

  static async fetchFunctions(teamId: string): Promise<EventFunction[]> {
    console.log('Fetching functions...');
    const { data, error } = await supabase
      .from('functions')
      .select('*')
      .eq('team_id', teamId)
      .order('name');

    if (error) {
      console.error('Error fetching functions:', error);
      throw error;
    }

    console.log('Functions fetched:', data?.length || 0);
    return data || [];
  }

  static async fetchAssignments(teamId: string): Promise<EventAssignment[]> {
    console.log('Fetching assignments...');
    const { data, error } = await supabase
      .from('personnel_allocations')
      .select('*')
      .eq('team_id', teamId);

    if (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }

    console.log('Assignments fetched:', data?.length || 0);
    return data || [];
  }

  static async fetchDivisions(teamId: string): Promise<Division[]> {
    console.log('Fetching divisions...');
    const { data, error } = await supabase
      .from('event_divisions')
      .select('*')
      .eq('team_id', teamId);

    if (error) {
      console.error('Error fetching divisions:', error);
      throw error;
    }

    console.log('Divisions fetched:', data?.length || 0);
    return data || [];
  }

  static async fetchWorkLogs(teamId: string): Promise<WorkLog[]> {
    console.log('Fetching work logs...');
    const { data, error } = await supabase
      .from('work_records')
      .select('*')
      .eq('team_id', teamId);

    if (error) {
      console.error('Error fetching work logs:', error);
      throw error;
    }

    console.log('Work logs fetched:', data?.length || 0);
    return data || [];
  }

  static async createSampleData(teamId: string, userId: string): Promise<boolean> {
    console.log('Creating sample data for team:', teamId);
    
    try {
      // Criar funções de exemplo
      const functionsToCreate = [
        { name: 'Técnico de Som', description: 'Responsável pela operação de equipamentos de áudio' },
        { name: 'Técnico de Luz', description: 'Responsável pela iluminação do evento' },
        { name: 'Coordenador Geral', description: 'Responsável pela coordenação geral do evento' },
        { name: 'Assistente', description: 'Auxilia nas atividades gerais do evento' }
      ];

      const createdFunctions = [];
      for (const func of functionsToCreate) {
        const { data, error } = await supabase
          .from('functions')
          .insert([{ ...func, user_id: userId, team_id: teamId }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating function:', error);
          continue;
        }
        createdFunctions.push(data);
      }

      // Criar pessoal de exemplo
      const personnelToCreate = [
        {
          name: 'João Silva',
          type: 'fixo',
          email: 'joao@exemplo.com',
          phone: '(11) 99999-1111',
          monthly_salary: 3000,
          event_cache: 200,
          overtime_rate: 50,
          function_id: createdFunctions[0]?.id
        },
        {
          name: 'Maria Santos',
          type: 'freelancer',
          email: 'maria@exemplo.com',
          phone: '(11) 99999-2222',
          event_cache: 300,
          overtime_rate: 60,
          function_id: createdFunctions[1]?.id
        },
        {
          name: 'Pedro Costa',
          type: 'fixo',
          email: 'pedro@exemplo.com',
          phone: '(11) 99999-3333',
          monthly_salary: 4000,
          event_cache: 250,
          overtime_rate: 70,
          function_id: createdFunctions[2]?.id
        }
      ];

      const createdPersonnel = [];
      for (const person of personnelToCreate) {
        const { data, error } = await supabase
          .from('personnel')
          .insert([{ ...person, user_id: userId, team_id: teamId }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating personnel:', error);
          continue;
        }
        createdPersonnel.push(data);
      }

      // Criar eventos de exemplo
      const eventsToCreate = [
        {
          name: 'Show de Rock - Banda XYZ',
          description: 'Show de rock com sonorização completa',
          start_date: '2024-01-15',
          end_date: '2024-01-15',
          status: 'planejado'
        },
        {
          name: 'Casamento - Ana & Carlos',
          description: 'Cerimônia e festa de casamento com som e luz',
          start_date: '2024-01-20',
          end_date: '2024-01-20',
          status: 'em_andamento'
        },
        {
          name: 'Conferência Tech 2024',
          description: 'Conferência de tecnologia com transmissão ao vivo',
          start_date: '2024-01-25',
          end_date: '2024-01-27',
          status: 'planejado'
        }
      ];

      for (const event of eventsToCreate) {
        const { error } = await supabase
          .from('events')
          .insert([{ ...event, user_id: userId, team_id: teamId }]);
        
        if (error) {
          console.error('Error creating event:', error);
        }
      }

      console.log('Sample data created successfully');
      return true;
    } catch (error) {
      console.error('Error creating sample data:', error);
      return false;
    }
  }
}
