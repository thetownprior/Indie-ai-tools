import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';

export type ToolEntry = CollectionEntry<'tools'>;

export const REQUIRED_SECTIONS = [
  'What it is',
  "Who it's for",
  'Standout details',
  'Pricing',
  'Honest verdict',
] as const;

const PUBLISHED_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAMPLE_NAME = 'Example Notebook';

export interface TermGroup {
  slug: string;
  name: string;
  tools: ToolEntry[];
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function showDrafts(): boolean {
  return import.meta.env.DEV && import.meta.env.PUBLIC_SHOW_DRAFTS === 'true';
}

export function isPublic(tool: ToolEntry): boolean {
  return showDrafts() || tool.data.draft !== true;
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function pricingLabel(pricing: ToolEntry['data']['pricing']): string {
  const model = pricing.model === 'free' ? 'Free' : pricing.model === 'freemium' ? 'Freemium' : 'Paid';
  return pricing.startingPrice ? `${model} · ${pricing.startingPrice}` : model;
}

export function pricingModelLabel(model: ToolEntry['data']['pricing']['model']): string {
  if (model === 'free') return 'Free';
  if (model === 'freemium') return 'Freemium';
  return 'Paid';
}

export function searchText(tool: ToolEntry): string {
  return [
    tool.data.name,
    tool.data.tagline,
    tool.data.audience,
    tool.data.category,
    tool.data.maker ?? '',
    tool.data.verdict,
    ...tool.data.tags,
  ]
    .join(' ')
    .toLowerCase();
}

export function byNewest(a: ToolEntry, b: ToolEntry): number {
  const delta = b.data.dateAdded.getTime() - a.data.dateAdded.getTime();
  if (delta !== 0) return delta;
  return a.data.name.localeCompare(b.data.name);
}

export async function getAllTools(): Promise<ToolEntry[]> {
  const entries = await getCollection('tools');
  for (const entry of entries) validateEntry(entry);
  assertSample(entries);
  assertUniqueTerms(entries);
  return entries;
}

export async function getPublishedTools(): Promise<ToolEntry[]> {
  const tools = await getAllTools();
  return tools.filter(isPublic).sort(byNewest);
}

export async function getCategories(): Promise<TermGroup[]> {
  const tools = await getPublishedTools();
  return groupTerms(tools, (tool) => tool.data.category, 'category');
}

export async function getTagGroups(): Promise<TermGroup[]> {
  const tools = await getPublishedTools();
  const map = new Map<string, TermGroup>();
  for (const tool of tools) {
    for (const tag of tool.data.tags) {
      const slug = requireSlug(tag, `tag on ${tool.id}`);
      const existing = map.get(slug);
      if (existing && existing.name !== tag) {
        throw new Error(`Tag slug collision: "${existing.name}" and "${tag}" both become /tag/${slug}/.`);
      }
      if (!existing) map.set(slug, { slug, name: tag, tools: [] });
      const group = map.get(slug)!;
      if (!group.tools.some((item) => item.id === tool.id)) group.tools.push(tool);
    }
  }
  for (const group of map.values()) group.tools.sort(byNewest);
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function groupTerms(tools: ToolEntry[], labelOf: (tool: ToolEntry) => string, kind: string): TermGroup[] {
  const map = new Map<string, TermGroup>();
  for (const tool of tools) {
    const name = labelOf(tool).trim();
    const slug = requireSlug(name, `${kind} on ${tool.id}`);
    const existing = map.get(slug);
    if (existing && existing.name !== name) {
      throw new Error(`${kind} slug collision: "${existing.name}" and "${name}" both become /${kind}/${slug}/.`);
    }
    if (!existing) map.set(slug, { slug, name, tools: [] });
    map.get(slug)!.tools.push(tool);
  }
  for (const group of map.values()) group.tools.sort(byNewest);
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function requireSlug(value: string, label: string): string {
  const slug = slugify(value);
  if (!slug) {
    throw new Error(`${label} cannot be turned into a URL slug: "${value}".`);
  }
  return slug;
}

function validateEntry(entry: ToolEntry) {
  const where = entry.filePath ?? `src/content/tools/${entry.id}.md`;
  const fail = (message: string): never => {
    throw new Error(`${where}: ${message}`);
  };

  if (!entry.data.draft) {
    if (!PUBLISHED_SLUG.test(entry.id)) {
      fail(
        `filename slug "${entry.id}" is not publishable. Use lowercase letters, numbers, and single hyphens, like northwind-notes.md.`,
      );
    }
    if (entry.data.name === SAMPLE_NAME) {
      fail(`"${SAMPLE_NAME}" is reserved for the draft sample. Create a new file for a real tool.`);
    }
    if (isExampleHost(entry.data.website) || (entry.data.affiliateUrl && isExampleHost(entry.data.affiliateUrl))) {
      fail('Replace example.com before publishing. The sample domain is not a real product URL.');
    }
  }

  if (entry.data.logo) {
    const relative = entry.data.logo.replace(/^\//, '');
    const file = path.join(process.cwd(), 'public', relative);
    if (!fs.existsSync(file)) {
      fail(`logo file not found at public/${relative}.`);
    }
  }

  const body = markdownBody(entry).replace(/\r\n/g, '\n').replace(/```[\s\S]*?```/g, '');
  const headings = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1]?.trim() ?? '');
  const expected = [...REQUIRED_SECTIONS];
  if (headings.length !== expected.length || expected.some((heading, index) => headings[index] !== heading)) {
    fail(
      `body must contain exactly these H2 sections, in order: ${expected.map((heading) => `"## ${heading}"`).join(', ')}.`,
    );
  }

  const verdictAt = body.indexOf('## Honest verdict');
  const prosAt = body.search(/^### Pros\s*$/m);
  const consAt = body.search(/^### Cons\s*$/m);
  if (prosAt === -1 || consAt === -1 || prosAt < verdictAt || consAt < prosAt) {
    fail('Under "## Honest verdict", include "### Pros" and then "### Cons", in that order.');
  }
}

function markdownBody(entry: ToolEntry): string {
  if (typeof entry.body === 'string') return entry.body;
  if (entry.filePath && fs.existsSync(entry.filePath)) {
    const raw = fs.readFileSync(entry.filePath, 'utf8');
    return raw.replace(/^---[\s\S]*?---\s*/, '');
  }
  throw new Error(`src/content/tools/${entry.id}.md: missing markdown body.`);
}

function assertSample(entries: ToolEntry[]) {
  const sample = entries.find((entry) => entry.id === '_example' || entry.filePath?.endsWith('_example.md'));
  if (!sample) {
    throw new Error(
      'Missing src/content/tools/_example.md. Keep the sample in the collection with draft: true so the schema stays checked.',
    );
  }
  if (sample.data.draft !== true) {
    throw new Error('src/content/tools/_example.md must stay draft: true so the sample never ships.');
  }
  if (sample.data.name !== SAMPLE_NAME) {
    throw new Error('Do not turn src/content/tools/_example.md into a real review. Add a new markdown file.');
  }
}

function assertUniqueTerms(entries: ToolEntry[]) {
  const categories = new Map<string, string>();
  const tags = new Map<string, string>();
  for (const entry of entries) {
    remember(categories, entry.data.category, 'category');
    for (const tag of entry.data.tags) remember(tags, tag, 'tag');
  }
}

function remember(seen: Map<string, string>, label: string, kind: string) {
  const slug = slugify(label);
  if (!slug) {
    throw new Error(`${kind} "${label}" cannot be turned into a URL slug.`);
  }
  const existing = seen.get(slug);
  if (existing && existing !== label) {
    const prefix = kind === 'category' ? '/category/' : '/tag/';
    throw new Error(`${kind} slug collision: "${existing}" and "${label}" both become ${prefix}${slug}/.`);
  }
  if (!existing) seen.set(slug, label);
}

function isExampleHost(value: string): boolean {
  const host = new URL(value).hostname.toLowerCase();
  return host === 'example.com' || host.endsWith('.example.com');
}
