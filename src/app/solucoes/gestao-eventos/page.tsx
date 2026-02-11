import { criarMetadataPagina } from "../../../lib/seo";
import EventManagement from "../../../conteudos/solutions/EventManagement";

export const metadata = criarMetadataPagina({
  titulo: "Gestão de Eventos",
  descricao:
    "Crie e gerencie eventos com datas precisas, controle de status e organização completa.",
  caminhoCanonico: "/solucoes/gestao-eventos",
});

export default function Page() {
  return <EventManagement />;
}
