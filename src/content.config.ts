import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Typed frontmatter for `src/content/tools/<slug>.md`.
 * Human-facing rules, section order, and the publish steps live in CONTENT_GUIDE.md.
 * If the guide and this schema disagree, this file wins: the build fails closed.
 */
const text = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`);

const httpUrl = z.string().trim().pipe(z.httpUrl('Must be an http(s) URL'));

const pricing = z
  .strictObject({
    model: z.enum(['free', 'freemium', 'paid']),
    startingPrice: text(1, 40, 'pricing.startingPrice').optional(),
  })
  .superRefine((value, ctx) => {
    if (value.model === 'paid' && !value.startingPrice) {
      ctx.addIssue({
        code: 'custom',
        path: ['startingPrice'],
        message: 'startingPrice is required when pricing.model is paid.',
      });
    }
    if (value.model === 'free' && value.startingPrice) {
      ctx.addIssue({
        code: 'custom',
        path: ['startingPrice'],
        message: 'Omit startingPrice when pricing.model is free.',
      });
    }
  });

const tools = defineCollection({
  loader: glob({
    base: './src/content/tools',
    // Top-level files only. Logos live in public/logos/, not beside the markdown.
    pattern: '*.md',
  }),
  schema: z
    .strictObject({
      name: text(1, 80, 'name'),
      tagline: text(10, 140, 'tagline'),
      website: httpUrl,
      category: text(2, 40, 'category'),
      tags: z.array(text(2, 32, 'tag')).max(8, 'Use at most 8 tags').default([]),
      pricing,
      audience: text(3, 120, 'audience'),
      maker: text(1, 80, 'maker').optional(),
      logo: z
        .string()
        .trim()
        .regex(
          /^\/logos\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:svg|png|webp)$/,
          'logo must be a public path like /logos/<slug>.svg, .png, or .webp',
        )
        .optional(),
      affiliateUrl: httpUrl.optional(),
      featured: z.boolean().default(false),
      sponsored: z.boolean().default(false),
      verdict: text(40, 200, 'verdict'),
      dateAdded: z.coerce.date(),
      lastReviewed: z.coerce.date(),
      draft: z.boolean().default(false),
    })
    .superRefine((entry, ctx) => {
      if (entry.lastReviewed < entry.dateAdded) {
        ctx.addIssue({
          code: 'custom',
          path: ['lastReviewed'],
          message: 'lastReviewed must be on or after dateAdded.',
        });
      }
      const tags = new Set<string>();
      entry.tags.forEach((tag, index) => {
        const key = tag.toLowerCase();
        if (tags.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: ['tags', index],
            message: `Duplicate tag "${tag}".`,
          });
        }
        tags.add(key);
      });
    }),
});

export const collections = { tools };
