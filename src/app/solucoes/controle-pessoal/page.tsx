import { criarMetadataPagina } from "../../../lib/seo";
import PersonnelControl from "../../../conteudos/solutions/PersonnelControl";

export const metadata = criarMetadataPagina({
  titulo: "Controle de Pessoal",
  descricao: "Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações.",
  caminhoCanonico: "/solucoes/controle-pessoal",
});

export default function Page() {
  return <PersonnelControl />;
}
