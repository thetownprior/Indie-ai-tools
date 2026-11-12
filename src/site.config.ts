/**
 * Site copy, and the only application settings that decide where the site is hosted.
 *
 * GitHub Pages project site (current):
 *   url:  'https://thetownprior.github.io'
 *   base: '/Indie-ai-tools'
 *
 * Custom domain at the domain root — change these two fields, then add public/CNAME:
 *   url:  'https://example.com'
 *   base: '/'
 *
 * Internal links read `base` from the Astro config, so page templates do not need edits.
 * See README.md → "Custom domain".
 */
export const deployment = {
  /** Origin only. No path and no trailing slash. */
  url: 'https://thetownprior.github.io',
  /**
   * Path the site is served from.
   * Use '/' on a custom domain or a user/organization site.
   * No trailing slash.
   */
  base: '/Indie-ai-tools',
} as const;

export const siteConfig = {
  name: 'Indie AI Tools',
  description:
    'Curated reviews of indie AI tools for solo creators and small businesses. One tool at a time, with pricing and a plain verdict.',
  locale: 'en',
  ogLocale: 'en_US',
  author: 'Indie AI Tools',
  /**
   * Inbox for the Submit page. example.com is reserved and is only a placeholder.
   * Replace this before you invite submissions.
   */
  submitEmail: 'submit@example.com',
  latestLimit: 8,
} as const;
