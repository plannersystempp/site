import { criarMetadataPagina } from "../../lib/seo";
import PrivacyPolicy from "../../conteudos/PrivacyPolicy";

export const metadata = criarMetadataPagina({
  titulo: "Política de Privacidade",
  descricao: "Saiba como o PlannerSystem coleta, usa e protege seus dados pessoais.",
  caminhoCanonico: "/privacidade",
});

export default function Page() {
  return <PrivacyPolicy />;
}
