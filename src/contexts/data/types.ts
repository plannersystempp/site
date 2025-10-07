
// Core data types
export interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  payment_due_date?: string;
  location?: string;
  client_contact_phone?: string;
  setup_start_date?: string;
  setup_end_date?: string;
  status?: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado' | 'concluido_pagamento_pendente';
  team_id: string;
  created_at: string;
}

export interface Personnel {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  type: 'fixo' | 'freelancer';
  monthly_salary: number;
  event_cache: number;
  overtime_rate: number;
  team_id: string;
  created_at: string;
  functions?: EventFunction[]; // Array of associated functions
}

export interface EventFunction {
  id: string;
  name: string;
  description: string;
  team_id: string;
  created_at: string;
}

// Extended function type for super admin view with team information
export interface EventFunctionWithTeam extends EventFunction {
  team_name?: string;
}

export interface EventAssignment {
  id: string;
  event_id: string;
  personnel_id: string;
  division_id: string;
  function_name: string;
  work_days: string[];
  event_specific_cache?: number;
  team_id: string;
  created_at: string;
}

export interface Division {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  team_id: string;
  created_at: string;
}

export interface WorkLog {
  id: string;
  employee_id: string;
  event_id: string;
  work_date: string;
  hours_worked: number;
  overtime_hours: number;
  total_pay: number;
  paid: boolean;
  date_logged: string;
  team_id: string;
  created_at: string;
}

export interface Absence {
  id: string;
  team_id: string;
  assignment_id: string;
  work_date: string;
  logged_by_id?: string;
  notes?: string;
  created_at: string;
}
