import { criarMetadataPagina } from "../lib/seo";
import Landing from "../conteudos/Landing";

export const metadata = criarMetadataPagina({
  titulo: "O Sistema Completo para Gestão de Eventos",
  descricao:
    "Simplifique a gestão dos seus eventos com o PlannerSystem. Controle financeiro, gestão de equipe, escalas e relatórios em uma única plataforma.",
  caminhoCanonico: "/",
});

export default function Page() {
  return <Landing />;
}
