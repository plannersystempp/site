import { criarMetadataPagina } from "../../lib/seo";
import About from "../../conteudos/About";

export const metadata = criarMetadataPagina({
  titulo: "Sobre Nós",
  descricao: "Conheça a história e missão do PlannerSystem. Transformando a gestão de eventos.",
  caminhoCanonico: "/sobre",
});

export default function Page() {
  return <About />;
}
