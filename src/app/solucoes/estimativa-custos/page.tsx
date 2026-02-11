import { criarMetadataPagina } from "../../../lib/seo";
import CostEstimation from "../../../conteudos/solutions/CostEstimation";

export const metadata = criarMetadataPagina({
  titulo: "Estimativa de Custos",
  descricao: "Visualize custos estimados por evento e acompanhe o orçamento em tempo real.",
  caminhoCanonico: "/solucoes/estimativa-custos",
});

export default function Page() {
  return <CostEstimation />;
}
