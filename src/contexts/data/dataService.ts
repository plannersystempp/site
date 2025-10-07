
import { supabase } from '@/integrations/supabase/client';
import { 
  CreateEventData, 
  CreatePersonnelData, 
  CreateFunctionData,
  CreateAssignmentData,
  CreateDivisionData,
  CreateWorkLogData,
  CreateAbsenceData,
  UpdatePersonnelData,
  UpdateEventData,
  UpdateFunctionData,
  UpdateDivisionData
} from './formTypes';

export class DataService {
  // Event operations
  static async createEvent(event: CreateEventData, userId: string, teamId: string) {
    console.log('Creating event with data:', { event, userId, teamId });
    
    const { data, error } = await supabase
      .from('events')
      .insert([{ ...event, team_id: teamId }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }
    
    console.log('Event created successfully:', data);
    return data;
  }

  static async updateEvent(id: string, event: UpdateEventData) {
    console.log('Updating event:', id, event);
    
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }
    
    console.log('Event updated successfully:', data);
    return data;
  }

  // Personnel operations
  static async createPersonnel(personnel: CreatePersonnelData, userId: string, teamId: string) {
    console.log('Creating personnel with data:', { personnel, userId, teamId });
    
    const { data, error } = await supabase
      .from('personnel')
      .insert([{ ...personnel, team_id: teamId }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating personnel:', error);
      throw error;
    }
    
    console.log('Personnel created successfully:', data);
    return data;
  }

  static async updatePersonnel(id: string, personnel: UpdatePersonnelData) {
    console.log('Updating personnel:', id, personnel);
    
    const { data, error } = await supabase
      .from('personnel')
      .update(personnel)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating personnel:', error);
      throw error;
    }
    
    console.log('Personnel updated successfully:', data);
    return data;
  }

  static async deletePersonnel(id: string) {
    console.log('Deleting personnel:', id);
    
    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting personnel:', error);
      throw error;
    }
    
    console.log('Personnel deleted successfully');
  }

  // Function operations
  static async createFunction(func: CreateFunctionData, userId: string, teamId: string) {
    console.log('Creating function with data:', { func, userId, teamId });
    
    const { data, error } = await supabase
      .from('functions')
      .insert([{ ...func, team_id: teamId }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating function:', error);
      throw error;
    }
    
    console.log('Function created successfully:', data);
    return data;
  }

  static async updateFunction(id: string, func: UpdateFunctionData) {
    console.log('Updating function:', id, func);
    
    const { data, error } = await supabase
      .from('functions')
      .update(func)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating function:', error);
      throw error;
    }
    
    console.log('Function updated successfully:', data);
    return data;
  }

  static async deleteFunction(id: string) {
    console.log('Deleting function:', id);
    
    const { error } = await supabase
      .from('functions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting function:', error);
      throw error;
    }
    
    console.log('Function deleted successfully');
  }

  // Assignment operations
  static async addAssignment(assignment: CreateAssignmentData, userId: string, teamId: string) {
    console.log('Creating assignment with data:', { assignment, userId, teamId });
    
    const { data, error } = await supabase
      .from('personnel_allocations')
      .insert([{ ...assignment, team_id: teamId }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
    
    console.log('Assignment created successfully:', data);
    return data;
  }

  static async deleteAssignment(id: string) {
    console.log('Deleting assignment:', id);
    
    const { error } = await supabase
      .from('personnel_allocations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
    
    console.log('Assignment deleted successfully');
  }

  // Division operations
  static async addDivision(division: CreateDivisionData, userId: string): Promise<string> {
    console.log('Creating division with data:', { division, userId });
    
    const { data, error } = await supabase
      .from('event_divisions')
      .insert([division])
      .select()
      .single();

    if (error) {
      console.error('Error creating division:', error);
      throw error;
    }
    
    console.log('Division created successfully:', data);
    return data.id;
  }

  static async updateDivision(id: string, division: UpdateDivisionData) {
    console.log('Updating division:', id, division);
    
    const { data, error } = await supabase
      .from('event_divisions')
      .update(division)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating division:', error);
      throw error;
    }
    
    console.log('Division updated successfully:', data);
    return data;
  }

  // Work log operations
  static async addWorkLog(workLog: CreateWorkLogData, userId: string) {
    console.log('Creating work log with data:', { workLog, userId });
    
    const { data, error } = await supabase
      .from('work_records')
      .insert([workLog])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating work log:', error);
      throw error;
    }
    
    console.log('Work log created successfully:', data);
    return data;
  }

  // Absence operations
  static async addAbsence(absence: CreateAbsenceData, userId: string) {
    console.log('Creating absence with data:', { absence, userId });
    
    const { data, error } = await supabase
      .from('absences')
      .insert(absence)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating absence:', error);
      throw error;
    }
    
    console.log('Absence created successfully:', data);
    return data;
  }

  // Método utilitário para criar dados de exemplo
  static async createSampleDataForTeam(teamId: string, userId: string) {
    console.log('Creating sample data for team:', teamId);
    
    try {
      // Usar o método do DataFetcher para criar dados de exemplo
      const { DataFetcher } = await import('./dataFetcher');
      return await DataFetcher.createSampleData(teamId, userId);
    } catch (error) {
      console.error('Error creating sample data:', error);
      return false;
    }
  }
}
