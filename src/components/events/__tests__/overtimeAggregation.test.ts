import { describe, it, expect } from 'vitest';

interface Assignment {
  id: string;
  event_id: string;
  personnel_id: string;
  work_days: string[];
  function_name: string;
  division_id: string;
  team_id: string;
  created_at: string;
}

interface WorkRecord {
  id: string;
  team_id: string;
  employee_id: string;
  event_id: string;
  work_date: string;
  hours_worked: number;
  overtime_hours: number;
  total_pay: number;
  created_at: string;
}

describe('Aggregação de horas extras', () => {
  it('soma apenas registros cujas datas estão em work_days', () => {
    const assignment: Assignment = {
      id: 'a1',
      event_id: 'e1',
      personnel_id: 'p1',
      work_days: ['2025-10-01', '2025-10-02'],
      function_name: 'Operador',
      division_id: 'd1',
      team_id: 't1',
      created_at: new Date().toISOString()
    };

    const workLogs: WorkRecord[] = [
      { id: 'w1', team_id: 't1', employee_id: 'p1', event_id: 'e1', work_date: '2025-10-01', hours_worked: 8, overtime_hours: 2, total_pay: 0, created_at: '' },
      { id: 'w2', team_id: 't1', employee_id: 'p1', event_id: 'e1', work_date: '2025-10-02', hours_worked: 8, overtime_hours: 1, total_pay: 0, created_at: '' },
      { id: 'w3', team_id: 't1', employee_id: 'p1', event_id: 'e1', work_date: '2025-10-03', hours_worked: 8, overtime_hours: 4, total_pay: 0, created_at: '' },
    ];

    const assignmentWorkLogs = workLogs.filter(log =>
      log.employee_id === assignment.personnel_id &&
      log.event_id === assignment.event_id &&
      assignment.work_days.includes(log.work_date)
    );

    const totalOvertimeHours = assignmentWorkLogs.reduce((sum, log) => sum + log.overtime_hours, 0);

    expect(totalOvertimeHours).toBe(3);
  });
});