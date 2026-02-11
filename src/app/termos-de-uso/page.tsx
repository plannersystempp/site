import { criarMetadataPagina } from "../../lib/seo";
import TermsOfUse from "../../conteudos/TermsOfUse";

export const metadata = criarMetadataPagina({
  titulo: "Termos de Uso",
  descricao: "Termos de uso e condições gerais para utilização da plataforma PlannerSystem.",
  caminhoCanonico: "/termos-de-uso",
});

export default function Page() {
  return <TermsOfUse />;
}
