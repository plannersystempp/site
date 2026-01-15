import { Metadata } from 'next';
import CostEstimation from '../../../pages/solutions/CostEstimation';

export const metadata: Metadata = {
  title: "Estimativa de Custos | PlannerSystem",
  description: "Visualize custos estimados por evento e acompanhe o orçamento em tempo real.",
};

export default function Page() {
  return <CostEstimation />;
}
