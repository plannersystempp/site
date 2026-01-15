import { Metadata } from 'next';
import TermsOfUse from '../../pages/TermsOfUse';

export const metadata: Metadata = {
  title: "Termos de Uso | PlannerSystem",
  description: "Termos de uso e condições gerais para utilização da plataforma PlannerSystem.",
};

export default function Page() {
  return <TermsOfUse />;
}
