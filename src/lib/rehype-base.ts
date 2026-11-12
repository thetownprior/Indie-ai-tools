import { deployment } from '../site.config';

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/**
 * Prefix root-relative links and images with the configured base.
 * Authors write `/tools/some-slug/` and this plugin inserts `/Indie-ai-tools`
 * (or nothing, once `deployment.base` is `/`).
 */
export function rehypePrefixBase() {
  const base = deployment.base === '/' ? '' : deployment.base.replace(/\/$/, '');

  return (tree: HastNode) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || !node.properties) return;
      if (node.tagName === 'a' && typeof node.properties.href === 'string') {
        const original = node.properties.href;
        node.properties.href = prefixRoot(original, base);
        if (/^https?:\/\//.test(original)) {
          node.properties.rel = mergeRel(node.properties.rel, ['noopener']);
        }
      }
      if (node.tagName === 'img' && typeof node.properties.src === 'string') {
        node.properties.src = prefixRoot(node.properties.src, base);
      }
    });
  };
}

function prefixRoot(value: string, base: string): string {
  if (!base || !value.startsWith('/') || value.startsWith('//')) return value;
  if (value === base || value.startsWith(`${base}/`)) return value;
  return `${base}${value}`;
}

function mergeRel(current: unknown, extra: string[]): string {
  const parts = new Set<string>();
  const existing = Array.isArray(current) ? current.map(String) : typeof current === 'string' ? current.split(/\s+/) : [];
  for (const part of existing) {
    if (part) parts.add(part);
  }
  for (const part of extra) parts.add(part);
  return [...parts].join(' ');
}

function walk(node: HastNode, visit: (node: HastNode) => void) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}
