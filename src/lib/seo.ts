import type { Metadata } from "next";

const URL_PADRAO_SITE = "https://plannersystem.com.br";

export function obterUrlBaseDoSite(): URL {
  const valor = process.env.NEXT_PUBLIC_SITE_URL ?? URL_PADRAO_SITE;

  try {
    return new URL(valor);
  } catch {
    try {
      return new URL(`https://${valor}`);
    } catch {
      return new URL(URL_PADRAO_SITE);
    }
  }
}

type ConfigMetadataPagina = {
  titulo: string;
  descricao: string;
  caminhoCanonico: string;
  imagemOg?: string;
};

export function criarMetadataPagina({
  titulo,
  descricao,
  caminhoCanonico,
  imagemOg = "/icons/logo_plannersystem.png",
}: ConfigMetadataPagina): Metadata {
  const urlBase = obterUrlBaseDoSite();
  const urlAbsoluta = new URL(caminhoCanonico, urlBase);

  return {
    title: titulo,
    description: descricao,
    alternates: {
      canonical: caminhoCanonico,
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: urlAbsoluta,
      title: titulo,
      description: descricao,
      siteName: "PlannerSystem",
      images: [
        {
          url: new URL(imagemOg, urlBase),
          alt: "PlannerSystem",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [new URL(imagemOg, urlBase)],
    },
  };
}

