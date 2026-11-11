# Content guide

This is the publishing manual for Indie AI Tools. A new public page is one Markdown file. Drop it in `src/content/tools/`, push it to `main`, and the GitHub Actions deploy builds it.

The machine-checked schema is [`src/content.config.ts`](src/content.config.ts). Extra checks (section order, slug shape, logo file, sample leftovers) live in [`src/lib/tools.ts`](src/lib/tools.ts). If this guide and those files disagree, the files win and `npm run build` fails.

Do not invent product facts. Write only what the research notes support: what the tool is, who it is for, what it costs, and the verdict. Do not add star ratings, user counts, or prices that were not supplied. If a price is a phrase, keep the phrase.

## Publish a new page

1. Pick a slug: lowercase letters, numbers, and single hyphens. Example: `northwind-notes`.
2. Create a new file at `src/content/tools/<slug>.md`. Do not edit `src/content/tools/_example.md`. Do not rename it and do not set its `draft` to `false`.
3. Write the frontmatter below. Omit `draft`, or set `draft: false`.
4. Write the five body sections, in order, including `### Pros` and `### Cons`.
5. If you have a logo, put it in `public/logos/` and set `logo`.
6. From the repo root, run `npm run build`. Fix every error it prints. The build is the check.
7. Commit the Markdown file and any new logo. Push to `main`.

The production build excludes every file with `draft: true`. To look at a draft locally, including the sample:

```bash
PUBLIC_SHOW_DRAFTS=true npm run dev
```

Then open `http://localhost:4321/Indie-ai-tools/tools/<slug>/`. That flag does nothing in `npm run build`.

## Slug rules

The filename is the URL slug. `src/content/tools/northwind-notes.md` becomes `/tools/northwind-notes/`.

- Use lowercase letters, numbers, and hyphens only.
- Do not start or end with a hyphen. Do not double a hyphen.
- Do not use underscores, spaces, or uppercase letters.
- One tool per file. Do not put tools in subfolders. The loader only reads `*.md` in `src/content/tools/`.
- Do not put a date in the slug unless the date is part of the product name.

`_example` is reserved for the sample. A published file cannot use the name `Example Notebook` or any `example.com` URL. Those checks exist so the sample cannot be flipped live by accident.

## Frontmatter

Write YAML between `---` lines. Dates are unquoted `YYYY-MM-DD`. Booleans are `true` or `false`. Unknown keys fail the build.

| Field | Required | Rules |
| --- | --- | --- |
| `name` | yes | Product name. 1–80 characters. |
| `tagline` | yes | One line for cards. 10–140 characters. No HTML. |
| `website` | yes | Official site, `http` or `https`. Not an affiliate link. |
| `category` | yes | One display name, 2–40 characters. Use a stable spelling. `Writing` and `writing` are different labels that would fight over the same URL. |
| `tags` | no | List of 0–8 short labels. Each tag is 2–32 characters. Omit the key for none. No duplicates. Prefer lowercase. |
| `pricing.model` | yes | Exactly `free`, `freemium`, or `paid`. |
| `pricing.startingPrice` | depends | Plain text, 1–40 characters, such as `"$12/month"`. Required for `paid`. Optional for `freemium`. Forbidden for `free` (omit the key). |
| `audience` | yes | Who it is for, in a short phrase. 3–120 characters. Shown on the tool page. |
| `maker` | no | Person or company name. 1–80 characters. Omit if unknown. |
| `logo` | no | Path of a file in `public/`, matching `/logos/<name>.svg`, `.png`, or `.webp`. `<name>` is lowercase letters, numbers, and hyphens. |
| `affiliateUrl` | no | `http` or `https` URL used instead of `website` on the main visit button. The button gets `rel="sponsored nofollow"`. |
| `featured` | no | `true` or `false`. Default `false`. Puts the tool in the home page featured block. |
| `sponsored` | no | `true` or `false`. Default `false`. Shows a visible **Sponsored** label. |
| `verdict` | yes | Plain-text summary, 40–200 characters. This is the meta description. No Markdown. |
| `dateAdded` | yes | `YYYY-MM-DD`. The day the page is first published. RSS sorts on this. |
| `lastReviewed` | yes | `YYYY-MM-DD`, on or after `dateAdded`. |
| `draft` | no | Default `false`. `true` keeps the file in the repo and out of the site, the sitemap, and the RSS feed. |

Paid placement uses both flags: `featured: true` and `sponsored: true`. Featured alone does not show the Sponsored label. Sponsored alone does not feature the tool.

`verdict` is the short summary. The body section `Honest verdict` is the longer pros and cons. They should not contradict each other.

### Minimal example

```yaml
---
name: Northwind Notes
tagline: A writing desk for founders who ship their own newsletter.
website: https://example.com
category: Writing
tags:
  - newsletters
  - drafting
pricing:
  model: paid
  startingPrice: "$12/month"
audience: Solo founders who write a weekly letter
verdict: A focused editor with a clear price. The export is the part worth testing before you commit.
dateAdded: 2026-04-02
lastReviewed: 2026-04-02
---
```

`northwind.example` above is not a real product. Replace it. Do not publish an `example.com` URL.

## Required sections

The body is Markdown. Use exactly these five level-2 headings, in this order, with this punctuation. The apostrophe in `Who it's for` is a straight `'`.

```markdown
## What it is

## Who it's for

## Standout details

## Pricing

## Honest verdict

### Pros

### Cons
```

- Do not add a sixth `##` heading. A subsection uses `###`.
- `### Pros` comes first, then `### Cons`, both after `## Honest verdict`.
- `Standout details` should be a list.
- `Pricing` should match `pricing.model` and `pricing.startingPrice`. Explain the free tier when the model is `freemium`.
- Pros and cons should be lists.
- No star ratings.

The page renders this Markdown as the review. The frontmatter fills the title, the summary quote, the fact list, and the visit button.

## Images

Logos are files, not hotlinked URLs.

1. Save the logo as `public/logos/<name>.svg`, `.png`, or `.webp`.
2. Set `logo: /logos/<name>.svg` (or the matching extension). The leading slash is required. Do not include `/Indie-ai-tools`.
3. The build fails if the file is missing.

SVG is a good default. Use PNG or WebP when the mark is a photograph or a complex bitmap. The template puts the product name in the heading, so the logo is decorative and does not need alt text in frontmatter.

Images inside the review are normal Markdown. Root-relative sources are prefixed with the site base:

```markdown
![Short description of the image](/logos/northwind-notes.svg)
```

Always write alt text for images in the body.

The default social image for the whole site is `public/og.png`. Tool pages use that image. You do not need a per-tool Open Graph image.

## Links

- Official site goes in `website`.
- Affiliate URL goes in `affiliateUrl` only. Do not use it as `website`. Do not hide it as the only link in the body.
- Links to other pages on this site are root-relative and include a trailing slash: `/tools/another-tool/`, `/category/writing/`, `/about/`.
- Do not prefix those links with `/Indie-ai-tools`. The build adds the base, and a custom domain would set the base back to `/`.
- External links can be normal `https://` URLs.

## What the build rejects

- Missing or extra frontmatter fields, or a field that breaks the limits above.
- `lastReviewed` before `dateAdded`.
- A published slug that is not lowercase-and-hyphens.
- A published `example.com` URL, or the reserved name `Example Notebook`.
- A logo path that does not point at a real file in `public/`.
- Body sections missing, renamed, reordered, or missing Pros / Cons.
- Two categories or two tags that slugify to the same URL but are spelled differently. `Customer support` and `Customer-support` both want `/category/customer-support/`. Pick one spelling and keep it.

Category and tag pages are created from published tools. You do not add a page file for them. The category URL is the slug of the `category` string (`Customer support` → `/category/customer-support/`). Tags work the same way under `/tag/<slug>/`.

## Sample file

`src/content/tools/_example.md` demonstrates every field and every section. It is fiction. Leave `draft: true`. Copy the structure into a new file rather than editing the sample into a real review.
