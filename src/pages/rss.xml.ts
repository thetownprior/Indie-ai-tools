import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getPublishedTools } from '../lib/tools';
import { absoluteUrl } from '../lib/urls';
import { siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const tools = await getPublishedTools();
  // `site` must be the deployed origin INCLUDING the base path.
  // Item links are relative to that URL (`tools/<slug>/`), not root-relative,
  // or the project path would be dropped.
  return rss({
    title: `${siteConfig.name} — new tools`,
    description: siteConfig.description,
    site: absoluteUrl('/'),
    trailingSlash: true,
    customData: '<language>en-us</language>',
    items: [...tools].sort((a, b) => b.data.dateAdded.getTime() - a.data.dateAdded.getTime()).map((tool) => ({
      title: tool.data.name,
      description: tool.data.verdict,
      pubDate: tool.data.dateAdded,
      link: `tools/${tool.id}/`,
    })),
  });
};
