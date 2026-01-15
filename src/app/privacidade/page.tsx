import { Metadata } from 'next';
import PrivacyPolicy from '../../pages/PrivacyPolicy';

export const metadata: Metadata = {
  title: "Política de Privacidade | PlannerSystem",
  description: "Saiba como o PlannerSystem coleta, usa e protege seus dados pessoais.",
};

export default function Page() {
  return <PrivacyPolicy />;
}
