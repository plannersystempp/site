import { criarMetadataPagina } from "../../../lib/seo";
import SmartReports from "../../../conteudos/solutions/SmartReports";

export const metadata = criarMetadataPagina({
  titulo: "Relatórios Inteligentes",
  descricao: "Gere relatórios completos de pagamentos com filtros avançados.",
  caminhoCanonico: "/solucoes/relatorios-inteligentes",
});

export default function Page() {
  return <SmartReports />;
}
