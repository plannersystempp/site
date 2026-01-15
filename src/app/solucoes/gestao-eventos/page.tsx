import { Metadata } from 'next';
import EventManagement from '../../../pages/solutions/EventManagement';

export const metadata: Metadata = {
  title: "Gestão de Eventos | PlannerSystem",
  description: "Crie e gerencie eventos com datas precisas, controle de status e organização completa.",
};

export default function Page() {
  return <EventManagement />;
}
