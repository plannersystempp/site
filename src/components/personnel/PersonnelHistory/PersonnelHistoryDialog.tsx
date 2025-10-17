import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { PersonnelStats } from './PersonnelStats';
import { PaymentHistoryTab } from './PaymentHistoryTab';
import { PendingPaymentsTab } from './PendingPaymentsTab';
import { EventsHistoryTab } from './EventsHistoryTab';

interface Personnel {
  id: string;
  name: string;
}

interface PersonnelHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: Personnel;
}

export const PersonnelHistoryDialog: React.FC<PersonnelHistoryDialogProps> = ({
  open,
  onOpenChange,
  personnel,
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('payments');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[90vh]' : 'max-w-4xl max-h-[85vh]'} overflow-hidden flex flex-col`}>
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Histórico - {personnel.name}
          </DialogTitle>
          <DialogDescription>
            Visualize o histórico completo de pagamentos, valores pendentes e eventos
          </DialogDescription>
        </DialogHeader>

        {/* Cards de estatísticas resumidas */}
        <PersonnelStats personnelId={personnel.id} />

        {/* Tabs para diferentes visões */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="payments" className="mt-0">
              <PaymentHistoryTab personnelId={personnel.id} />
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <PendingPaymentsTab personnelId={personnel.id} />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <EventsHistoryTab personnelId={personnel.id} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
