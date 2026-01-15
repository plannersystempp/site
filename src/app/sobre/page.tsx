import { Metadata } from 'next';
import About from '../../pages/About';

export const metadata: Metadata = {
  title: "Sobre Nós | PlannerSystem",
  description: "Conheça a história e missão do PlannerSystem. Transformando a gestão de eventos.",
};

export default function Page() {
  return <About />;
}
