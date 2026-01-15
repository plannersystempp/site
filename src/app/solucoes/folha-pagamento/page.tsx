import { Metadata } from 'next';
import Payroll from '../../../pages/solutions/Payroll';

export const metadata: Metadata = {
  title: "Folha de Pagamento | PlannerSystem",
  description: "Cálculo automático de pagamentos baseados em cachês diários e horas extras.",
};

export default function Page() {
  return <Payroll />;
}
