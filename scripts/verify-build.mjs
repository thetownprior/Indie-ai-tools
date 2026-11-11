import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const site = 'https://thetownprior.github.io/Indie-ai-tools/';
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    fail(`missing ${relative}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const required = [
  'index.html',
  '404.html',
  'rss.xml',
  'robots.txt',
  'sitemap-index.xml',
  'tools/index.html',
  'about/index.html',
  'affiliate-disclosure/index.html',
  'submit/index.html',
  'og.png',
  'favicon.svg',
];

for (const file of required) read(file);

const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
const banned = /google-analytics|googletagmanager|plausible\.io|umami|cloudflareinsights|doubleclick|connect\.facebook/i;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  if (html.includes('Example Notebook') || html.includes('/tools/_example')) {
    fail(`${relative} published the draft sample`);
  }
  if (banned.test(html)) fail(`${relative} includes a third-party analytics script`);
  const unprefixed = html.match(/(?:href|src)="\/(?!Indie-ai-tools\/)[^"]*"/g);
  if (unprefixed) fail(`${relative} has a root link missing the base: ${unprefixed.join(', ')}`);
}

const home = read('index.html');
if (!home.includes('No tools are published yet.')) {
  fail('home page is missing the empty-state line');
}
if (!home.includes(`rel="canonical" href="${site}"`) && !home.includes(`rel="canonical" href="${site.slice(0, -1)}"`)) {
  fail(`home canonical is not ${site}`);
}
const homeScripts = home
  .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/gi, '')
  .match(/<script\b/gi);
if (homeScripts) fail('home page includes client JavaScript');

const toolsPage = read('tools/index.html');
const toolsScripts = toolsPage
  .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/gi, '')
  .match(/<script\b/gi);
if (toolsPage.includes('No tools are published yet.') && toolsScripts) {
  fail('empty tools index includes client JavaScript');
}

const robots = read('robots.txt');
if (!robots.includes(`Sitemap: ${site}sitemap-index.xml`)) {
  fail('robots.txt sitemap URL is wrong');
}

const feed = read('rss.xml');
if (!feed.includes('<rss') || !feed.includes(site)) {
  fail('RSS feed is missing the site URL');
}
if (feed.includes('Example Notebook')) fail('RSS feed includes the draft sample');

const sitemap = read('sitemap-index.xml') + read('sitemap-0.xml');
if (sitemap.includes('_example') || sitemap.includes('404')) {
  fail('sitemap includes a draft or the 404 page');
}

const about = read('about/index.html');
const disclosure = read('affiliate-disclosure/index.html');
if (!disclosure.includes('rel="sponsored nofollow"') && !disclosure.includes('sponsored nofollow')) {
  fail('affiliate disclosure does not mention rel="sponsored nofollow"');
}
if (!about.includes('Sponsored')) fail('about page does not explain sponsored labels');

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML files in dist/. Draft sample stayed out of the build.`);
