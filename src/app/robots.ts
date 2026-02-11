import { MetadataRoute } from 'next';
import { obterUrlBaseDoSite } from '../lib/seo';

export default function robots(): MetadataRoute.Robots {
  const urlBase = obterUrlBaseDoSite().toString().replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/app/'],
      },
    ],
    sitemap: `${urlBase}/sitemap.xml`,
  };
}
