import { Metadata } from 'next';
import PersonnelControl from '../../../pages/solutions/PersonnelControl';

export const metadata: Metadata = {
  title: "Controle de Pessoal | PlannerSystem",
  description: "Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações.",
};

export default function Page() {
  return <PersonnelControl />;
}
