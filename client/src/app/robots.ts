import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://strangerlink.click';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/unprotectedapi/', '/duplicate-connection/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
