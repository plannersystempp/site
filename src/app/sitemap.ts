import { MetadataRoute } from 'next';
import { obterUrlBaseDoSite } from '../lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = obterUrlBaseDoSite().toString().replace(/\/$/, '');

  return [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/solucoes/gestao-eventos`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solucoes/controle-pessoal`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solucoes/folha-pagamento`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solucoes/estimativa-custos`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solucoes/relatorios-inteligentes`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacidade`,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/termos-de-uso`,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
