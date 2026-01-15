import { Metadata } from 'next';
import Landing from '../pages/Landing';

export const metadata: Metadata = {
  title: "O Sistema Completo para Gestão de Eventos | PlannerSystem",
  description: "Simplifique a gestão dos seus eventos com o PlannerSystem. Controle financeiro, gestão de equipe, escalas e relatórios em uma única plataforma.",
};

export default function Page() {
  return <Landing />;
}
