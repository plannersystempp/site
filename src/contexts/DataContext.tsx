
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useTeam } from './TeamContext';
import { useToast } from '@/hooks/use-toast';
import { DataService } from './data/dataService';
import { DataFetcher } from './data/dataFetcher';

// Re-export types for backward compatibility
export * from './data/types';
export * from './data/formTypes';

import {
  Event,
  Personnel,
  EventFunction,
  EventAssignment,
  Division,
  WorkLog
} from './data/types';

import {
  CreateEventData,
  CreatePersonnelData,
  CreateFunctionData,
  CreateAssignmentData,
  CreateDivisionData,
  CreateWorkLogData,
  UpdatePersonnelData,
  UpdateEventData,
  UpdateFunctionData,
  UpdateDivisionData
} from './data/formTypes';

interface DataContextType {
  events: Event[];
  personnel: Personnel[];
  functions: EventFunction[];
  assignments: EventAssignment[];
  divisions: Division[];
  workLogs: WorkLog[];
  loading: boolean;
  refreshData: () => Promise<void>;
  createEvent: (event: CreateEventData) => Promise<void>;
  createPersonnel: (personnel: CreatePersonnelData) => Promise<void>;
  createFunction: (func: CreateFunctionData) => Promise<void>;
  updatePersonnel: (id: string, personnel: UpdatePersonnelData) => Promise<void>;
  deletePersonnel: (id: string) => Promise<void>;
  updateFunction: (id: string, func: UpdateFunctionData) => Promise<void>;
  deleteFunction: (id: string) => Promise<void>;
  addEvent: (event: CreateEventData) => Promise<void>;
  updateEvent: (id: string, event: UpdateEventData) => Promise<void>;
  addPersonnel: (personnel: CreatePersonnelData) => Promise<void>;
  addFunction: (func: CreateFunctionData) => Promise<void>;
  addAssignment: (assignment: CreateAssignmentData) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  addDivision: (division: CreateDivisionData) => Promise<string>;
  updateDivision: (id: string, division: UpdateDivisionData) => Promise<void>;
  addWorkLog: (workLog: CreateWorkLogData) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [functions, setFunctions] = useState<EventFunction[]>([]);
  const [assignments, setAssignments] = useState<EventAssignment[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    if (!user || !activeTeam) return;

    try {
      setLoading(true);
      const data = await DataFetcher.fetchAllData(activeTeam.id);
      
      setEvents(data.events);
      setPersonnel(data.personnel);
      setFunctions(data.functions);
      setAssignments(data.assignments);
      setDivisions(data.divisions);
      setWorkLogs(data.workLogs);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: CreateEventData) => {
    if (!user || !activeTeam) return;
    await DataService.createEvent(event, user.id, activeTeam.id);
    await refreshData();
  };

  const updateEvent = async (id: string, event: UpdateEventData) => {
    await DataService.updateEvent(id, event);
    await refreshData();
  };

  const createPersonnel = async (personnel: CreatePersonnelData) => {
    if (!user || !activeTeam) return;
    await DataService.createPersonnel(personnel, user.id, activeTeam.id);
    await refreshData();
  };

  const updatePersonnel = async (id: string, personnel: UpdatePersonnelData) => {
    await DataService.updatePersonnel(id, personnel);
    await refreshData();
  };

  const deletePersonnel = async (id: string) => {
    await DataService.deletePersonnel(id);
    await refreshData();
  };

  const createFunction = async (func: CreateFunctionData) => {
    if (!user || !activeTeam) return;
    await DataService.createFunction(func, user.id, activeTeam.id);
    await refreshData();
  };

  const updateFunction = async (id: string, func: UpdateFunctionData) => {
    await DataService.updateFunction(id, func);
    await refreshData();
  };

  const deleteFunction = async (id: string) => {
    await DataService.deleteFunction(id);
    await refreshData();
  };

  const addAssignment = async (assignment: CreateAssignmentData) => {
    if (!user || !activeTeam) return;
    await DataService.addAssignment(assignment, user.id, activeTeam.id);
    await refreshData();
  };

  const deleteAssignment = async (id: string) => {
    await DataService.deleteAssignment(id);
    await refreshData();
  };

  const addDivision = async (division: CreateDivisionData): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    const id = await DataService.addDivision(division, user.id);
    await refreshData();
    return id;
  };

  const updateDivision = async (id: string, division: UpdateDivisionData) => {
    await DataService.updateDivision(id, division);
    await refreshData();
  };

  const addWorkLog = async (workLog: CreateWorkLogData) => {
    if (!user) return;
    await DataService.addWorkLog(workLog, user.id);
    await refreshData();
  };

  useEffect(() => {
    if (user && activeTeam) {
      refreshData();
    } else {
      setEvents([]);
      setPersonnel([]);
      setFunctions([]);
      setAssignments([]);
      setDivisions([]);
      setWorkLogs([]);
    }
  }, [user, activeTeam]);

  return (
    <DataContext.Provider value={{
      events,
      personnel,
      functions,
      assignments,
      divisions,
      workLogs,
      loading,
      refreshData,
      createEvent,
      createPersonnel,
      createFunction,
      updatePersonnel,
      deletePersonnel,
      updateFunction,
      deleteFunction,
      addEvent: createEvent,
      updateEvent,
      addPersonnel: createPersonnel,
      addFunction: createFunction,
      addAssignment,
      deleteAssignment,
      addDivision,
      updateDivision,
      addWorkLog,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
