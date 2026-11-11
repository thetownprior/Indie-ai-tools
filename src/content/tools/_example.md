---
name: Example Notebook
tagline: A fictional sample that shows every field in the review template. Not a real product.
website: https://example.com
category: Writing
tags:
  - example
  - template
pricing:
  model: freemium
  startingPrice: "$0 sample"
audience: People reading the content template
maker: Example Maker
logo: /logos/example.svg
affiliateUrl: https://example.com/affiliate
featured: true
sponsored: true
verdict: This draft only demonstrates the content schema. It is not a review of a real product and is excluded from the live site.
dateAdded: 2026-01-01
lastReviewed: 2026-01-15
draft: true
---

## What it is

Example Notebook is a fictional placeholder. It exists so the content schema, the required sections, and the page template can be checked without describing a real product.

The sample logo is ![the Example Notebook mark](/logos/example.svg). Internal links stay root-relative, like [all tools](/tools/), and the build prefixes the site base for you.

## Who it's for

This entry is for the person adding the next tool page. It is not for a customer, and it does not describe a buyer. Replace every field when you copy the structure into a new file.

## Standout details

- Every frontmatter field is filled in, including the optional ones.
- The body uses the five required sections, in order.
- Pros and cons sit under the verdict as their own headings.
- Nothing here is a claim about a product you can buy.

## Pricing

The frontmatter says `freemium` with a starting price of "$0 sample". Those words are placeholders so the pricing block has something to render. A real review states the price the way the maker publishes it, and does not invent a number the schema can pretend is exact.

## Honest verdict

Keep this sample as a draft. Add a real tool as a new Markdown file, then run the production build and confirm this page is absent.

### Pros

- Shows every field the schema accepts.
- Fails the build if a required section goes missing.

### Cons

- Not a real product, maker, or price.
- Must never be published. `draft: true` stays on this file.
