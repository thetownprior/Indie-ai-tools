import type { ToolEntry } from './tools';
import { isoDate, pricingLabel } from './tools';
import { absoluteUrl } from './urls';
import { siteConfig } from '../site.config';

export type JsonLd =
  | string
  | number
  | boolean
  | null
  | JsonLd[]
  | { [key: string]: JsonLd };

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl('/'),
    inLanguage: siteConfig.locale,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(name: string, tools: ToolEntry[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.data.name,
      url: absoluteUrl(`/tools/${tool.id}/`),
    })),
  };
}

export function toolJsonLd(tool: ToolEntry): JsonLd {
  const { data } = tool;
  const reviewed = isoDate(data.lastReviewed);
  const offer: JsonLd =
    data.pricing.model === 'free'
      ? {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          url: data.website,
        }
      : {
          '@type': 'Offer',
          description: pricingLabel(data.pricing),
          url: data.website,
        };

  const application: { [key: string]: JsonLd } = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.name,
    description: data.tagline,
    url: data.website,
    applicationCategory: data.category,
    offers: offer,
    review: {
      '@type': 'Review',
      reviewBody: data.verdict,
      datePublished: reviewed,
      author: {
        '@type': 'Organization',
        name: siteConfig.author,
        url: absoluteUrl('/'),
      },
      itemReviewed: {
        '@type': 'SoftwareApplication',
        name: data.name,
        url: data.website,
      },
    },
  };

  if (data.maker) {
    application.creator = {
      '@type': 'Organization',
      name: data.maker,
    };
  }

  return application;
}
