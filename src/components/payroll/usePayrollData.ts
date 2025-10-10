
import { useState, useEffect, useMemo } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventData, PayrollDetails } from './types';
import { useTeam } from '@/contexts/TeamContext';
import * as PayrollCalc from './payrollCalculations';

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

      // Filtrar logs de trabalho e ausências desta pessoa
      const personWorkLogs = eventData.workLogs.filter(log => 
        log.employee_id === personnelId
      );

      const personAbsences = (eventData.absences as any[]).filter((absence: any) => 
        (allocations as any[]).some((allocation: any) => allocation.id === absence.assignment_id)
      );

      // Converter para tipos do módulo de cálculo
      const allocationsData = allocations as PayrollCalc.AllocationData[];
      const workLogsData = personWorkLogs as PayrollCalc.WorkLogData[];
      const absencesData = personAbsences as PayrollCalc.AbsenceData[];
      const paymentRecords = eventData.closings.filter(
        closing => closing.personnel_id === person.id
      ) as PayrollCalc.PaymentRecord[];

      // === CÁLCULOS USANDO FUNÇÕES PURAS ===
      const totalWorkDays = PayrollCalc.calculateWorkedDays(allocationsData, absencesData);
      const regularHours = PayrollCalc.calculateTotalRegularHours(workLogsData);
      const totalOvertimeHours = PayrollCalc.calculateTotalOvertimeHours(workLogsData);
      const baseSalary = PayrollCalc.calculateBaseSalary(person);
      const cachePay = PayrollCalc.calculateCachePay(allocationsData, person, absencesData);
      
      // Calcular pagamento de horas extras com conversão (se configurado)
      const overtimeRate = person.overtime_rate || 0;
      const dailyCache = PayrollCalc.getDailyCacheRate(allocationsData, person);
      
      // Buscar config de HE do profissional (ou usar padrão da equipe - será implementado no componente)
      const overtimeThreshold = (person as any).overtime_threshold_hours || 8;
      const convertEnabled = (person as any).convert_overtime_to_daily || false;
      
      const overtimeResult = PayrollCalc.calculateOvertimePayWithConversion(
        totalOvertimeHours,
        {
          threshold: overtimeThreshold,
          convertEnabled,
          dailyCache,
          overtimeRate
        }
      );
      
      const totalPay = baseSalary + cachePay + overtimeResult.payAmount;
      const totalPaidAmount = PayrollCalc.calculateTotalPaid(paymentRecords);
      const pendingAmount = PayrollCalc.calculatePendingAmount(totalPay, totalPaidAmount);
      const isPaid = PayrollCalc.isPaymentComplete(totalPaidAmount, pendingAmount);

      // === PROCESSAMENTO DE DADOS PARA EXIBIÇÃO ===
      const absenceDetails = PayrollCalc.processAbsences(absencesData);
      const paymentHistory = PayrollCalc.processPaymentHistory(paymentRecords);
      const hasEventCache = PayrollCalc.hasEventSpecificCache(allocationsData);

      return {
        id: allocations[0].id,
        personnelId: person.id,
        personName: person.name,
        personType: person.type,
        workDays: totalWorkDays,
        regularHours,
        totalOvertimeHours: overtimeResult.displayHours,
        baseSalary,
        cachePay,
        overtimePay: overtimeResult.payAmount,
        totalPay,
        cacheRate: person.event_cache || 0,
        overtimeRate: person.overtime_rate || 0,
        paid: isPaid,
        paidAmount: totalPaidAmount,
        pendingAmount,
        paymentHistory,
        absencesCount: absencesData.length,
        absences: absenceDetails,
        hasEventSpecificCache: hasEventCache,
        eventSpecificCacheRate: dailyCache,
        overtimeConversionApplied: overtimeResult.conversionApplied,
        overtimeCachesUsed: overtimeResult.dailyCachesUsed,
        overtimeRemainingHours: overtimeResult.remainingHours
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
