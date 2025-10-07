
import { useState, useEffect, useMemo } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventData, PayrollDetails } from './types';
import { useTeam } from '@/contexts/TeamContext';

export const usePayrollData = (selectedEventId: string) => {
  const { personnel } = useEnhancedData();
  const { toast } = useToast();
  const { userRole } = useTeam();
  const [eventData, setEventData] = useState<EventData>({ allocations: [], workLogs: [], closings: [], absences: [] });
  const [pixKeys, setPixKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  useEffect(() => {
    const fetchEventData = async () => {
      if (!selectedEventId) {
        setEventData({ allocations: [], workLogs: [], closings: [], absences: [] });
        return;
      }

      try {
        setLoading(true);

        const [allocationsData, workLogsData, closingsData, absencesData] = await Promise.all([
          supabase
            .from('personnel_allocations')
            .select('*')
            .eq('event_id', selectedEventId),
          supabase
            .from('work_records')
            .select('*')
            .eq('event_id', selectedEventId),
          supabase
            .from('payroll_closings')
            .select('*')
            .eq('event_id', selectedEventId),
          supabase
            .from('absences')
            .select(`
              *,
              personnel_allocations!inner(event_id)
            `)
            .eq('personnel_allocations.event_id', selectedEventId)
        ]);

        setEventData({
          allocations: allocationsData.data || [],
          workLogs: workLogsData.data || [],
          closings: closingsData.data || [],
          absences: absencesData.data || []
        });

        // Fetch PIX keys for admins
        if (isAdmin && allocationsData.data?.length) {
          await fetchPixKeys(allocationsData.data.map(a => a.personnel_id));
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do evento",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [selectedEventId, toast, isAdmin]);

  const fetchPixKeys = async (personnelIds: string[]) => {
    try {
      // Remove duplicates
      const uniqueIds = [...new Set(personnelIds)];
      
      const { data, error } = await supabase.functions.invoke('pix-key/get', {
        body: { personnel_ids: uniqueIds }
      });

      if (error) {
        console.error('Error fetching PIX keys:', error);
        return;
      }

      setPixKeys(data?.pix_keys || {});
    } catch (error) {
      console.error('Error calling PIX key function:', error);
    }
  };

  const payrollDetails = useMemo(() => {
    if (!eventData.allocations.length) return [];

    // Agrupar alocações por personnel_id para evitar duplicatas
    const groupedAllocations = eventData.allocations.reduce((acc, allocation) => {
      const personnelId = allocation.personnel_id;
      if (!acc[personnelId]) {
        acc[personnelId] = [];
      }
      acc[personnelId].push(allocation);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(groupedAllocations).map(([personnelId, allocations]) => {
      const person = personnel.find(p => p.id === personnelId);
      if (!person) return null;

      const personWorkLogs = eventData.workLogs.filter(log => 
        log.employee_id === personnelId
      );

      // Get absences for this person
      const personAbsences = (eventData.absences as any[]).filter((absence: any) => 
        (allocations as any[]).some((allocation: any) => allocation.id === absence.assignment_id)
      );

      const totalOvertimeHours = personWorkLogs.reduce((sum, log) => sum + (log.overtime_hours || 0), 0);
      const regularHours = personWorkLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
      
      // Calculate cache pay considering unique work days and event_specific_cache
      let cachePay = 0;
      
      // Get all unique work days across all allocations for this event
      const allWorkDays = new Set<string>();
      for (const allocation of allocations as any[]) {
        (allocation.work_days || []).forEach((day: string) => allWorkDays.add(day));
      }
      
      // Count total absences for this person in this event
      const totalAbsences = personAbsences.length;
      
      // Calculate unique work days minus absences
      const uniqueWorkedDays = Math.max(0, allWorkDays.size - totalAbsences);
      
      // Use event_specific_cache from first allocation as daily rate if available, otherwise use person cache
      const firstAllocation = allocations[0] as any;
      if (firstAllocation.event_specific_cache && firstAllocation.event_specific_cache > 0) {
        // event_specific_cache is a daily rate specific for this event
        cachePay = uniqueWorkedDays * firstAllocation.event_specific_cache;
      } else {
        // Use person's daily cache rate and multiply by worked days
        const dailyRate = person.event_cache || 0;
        cachePay = uniqueWorkedDays * dailyRate;
      }

      // Total work days uses the same unique calculation as cache
      const totalWorkDays = uniqueWorkedDays;
      
      const baseSalary = person.type === 'fixo' ? (person.monthly_salary || 0) : 0;
      const overtimePay = totalOvertimeHours * (person.overtime_rate || 0);
      const totalPay = baseSalary + cachePay + overtimePay;

      // Get all payment records for this person
      const paymentRecords = eventData.closings.filter(closing => closing.personnel_id === person.id);
      const totalPaidAmount = paymentRecords.reduce((sum, record) => sum + (record.total_amount_paid || 0), 0);
      const pendingAmount = Math.max(0, totalPay - totalPaidAmount);
      const isPaid = pendingAmount === 0 && totalPaidAmount > 0;

      // Map absences with logged_by_name for display
      const absenceDetails = personAbsences.map((absence: any) => ({
        id: absence.id.toString(),
        work_date: absence.work_date,
        logged_by_name: absence.logged_by_name || 'Sistema',
        notes: absence.notes || '',
        created_at: absence.created_at
      }));

      // Map payment history
      const paymentHistory = paymentRecords.map(record => ({
        id: record.id,
        amount: record.total_amount_paid || 0,
        paidAt: record.paid_at || record.created_at,
        notes: record.notes || ''
      }));

      return {
        id: allocations[0].id, // Usar o ID da primeira alocação
        personnelId: person.id,
        personName: person.name,
        personType: person.type,
        workDays: totalWorkDays,
        regularHours,
        totalOvertimeHours,
        baseSalary,
        cachePay,
        overtimePay,
        totalPay,
        cacheRate: person.event_cache || 0,
        overtimeRate: person.overtime_rate || 0,
        paid: isPaid,
        paidAmount: totalPaidAmount,
        pendingAmount,
        paymentHistory,
        absencesCount: personAbsences.length,
        absences: absenceDetails,
        hasEventSpecificCache: !!(firstAllocation.event_specific_cache && firstAllocation.event_specific_cache > 0),
        eventSpecificCacheRate: firstAllocation.event_specific_cache || 0
      };
    }).filter(Boolean) as PayrollDetails[];
  }, [eventData, personnel]);

  return {
    eventData,
    setEventData,
    payrollDetails,
    pixKeys,
    loading
  };
};
