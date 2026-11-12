# Indie AI Tools

A static, SEO-first directory of indie AI tools for solo creators and small businesses. The site is an [Astro](https://astro.build) project. Pages are generated at build time from Markdown files in `src/content/tools/`. There is no database and almost no client JavaScript.

The public site can launch with zero published tools. `src/content/tools/_example.md` is a fictional sample with `draft: true`. The production build validates it and does not publish it.

## Requirements

- Node.js 22.23.4 or newer
- npm

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:4321/Indie-ai-tools/](http://localhost:4321/Indie-ai-tools/). The base path matches the GitHub Pages project URL, including in local dev.

To preview draft entries locally, including the sample tool page:

```bash
PUBLIC_SHOW_DRAFTS=true npm run dev
```

Drafts are shown only by the dev server. `npm run build` always excludes `draft: true`.

## Build

```bash
npm run build
```

This writes `dist/` and then checks that the draft sample was not emitted, internal links include the base path, and no analytics script was injected. Preview the production build with:

```bash
npm run preview
```

## Deploy

Pushes to `main` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and deploys it to GitHub Pages with the official Astro action. The site is published at:

https://thetownprior.github.io/Indie-ai-tools/

### One-time GitHub setting

GitHub does not use the Actions workflow until Pages is pointed at it.

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

The next push to `main` deploys the site. Pull requests run `.github/workflows/ci.yml`, which builds the site and does not deploy.

## Custom domain

Internal links, canonical URLs, the sitemap, `robots.txt`, and the RSS feed all read one object. To serve the site from a domain root, edit `deployment` in [`src/site.config.ts`](src/site.config.ts):

```ts
export const deployment = {
  url: 'https://example.com',
  base: '/',
};
```

That is the only application config change. Also:

1. Add `public/CNAME` containing the domain on a single line, for example `example.com`.
2. Point DNS at GitHub Pages, using GitHub's current Pages DNS instructions.
3. In **Settings → Pages**, set the custom domain if GitHub does not pick it up from `CNAME`.
4. Push to `main`.

Do not rewrite links in Markdown or templates. Authors keep writing root-relative URLs such as `/tools/some-tool/`. A rehype plugin prefixes the configured base at build time.

Switching back to the project URL is the same edit in reverse:

```ts
export const deployment = {
  url: 'https://thetownprior.github.io',
  base: '/Indie-ai-tools',
};
```

`url` is the origin only, with no path and no trailing slash. `base` is `/` or `/repo-name`, with no trailing slash. The repository name is case-sensitive in the Pages URL, so keep `Indie-ai-tools` exactly when you are on the project URL.

## Analytics

Nothing is loaded by default. The placeholder is [`src/components/Analytics.astro`](src/components/Analytics.astro), included from the base layout. Paste a cookieless script there when you want one, and mention it on the About page. Do not add a provider that sets cookies or an ad pixel without saying so.

## Submissions

The Submit page uses `submitEmail` in `src/site.config.ts`. The committed value is `submit@example.com`, a placeholder. Replace it before you invite suggestions.

## Content

New tool pages are documented for the publisher in [CONTENT_GUIDE.md](CONTENT_GUIDE.md). Short version: add `src/content/tools/<slug>.md`, run `npm run build`, commit, and push to `main`.

## Project map

| Path | Purpose |
| --- | --- |
| `src/site.config.ts` | Name, description, submit address, and the deploy URL |
| `src/content.config.ts` | Zod schema for the `tools` collection |
| `src/content/tools/` | One Markdown file per tool |
| `src/lib/tools.ts` | Draft filtering, section checks, category and tag slugs |
| `src/components/Analytics.astro` | Empty analytics slot |
| `public/` | Favicon, social image, and tool logos |
| `src/pages/rss.xml.ts` | RSS feed of newly added tools |
| `src/pages/robots.txt.ts` | robots.txt pointing at the sitemap |
