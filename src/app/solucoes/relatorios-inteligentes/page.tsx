import { Metadata } from 'next';
import SmartReports from '../../../pages/solutions/SmartReports';

export const metadata: Metadata = {
  title: "Relatórios Inteligentes | PlannerSystem",
  description: "Gere relatórios completos de pagamentos com filtros avançados.",
};

export default function Page() {
  return <SmartReports />;
}
