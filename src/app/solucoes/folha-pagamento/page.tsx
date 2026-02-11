import { criarMetadataPagina } from "../../../lib/seo";
import Payroll from "../../../conteudos/solutions/Payroll";

export const metadata = criarMetadataPagina({
  titulo: "Folha de Pagamento",
  descricao: "Cálculo automático de pagamentos baseados em cachês diários e horas extras.",
  caminhoCanonico: "/solucoes/folha-pagamento",
});

export default function Page() {
  return <Payroll />;
}
