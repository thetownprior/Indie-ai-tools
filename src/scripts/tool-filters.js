const form = document.querySelector('[data-tool-filters]');
if (form instanceof HTMLFormElement) {
  const tools = [...document.querySelectorAll('[data-tool]')];
  const empty = document.querySelector('[data-filter-empty]');
  const visibleCount = document.querySelector('[data-visible-count]');
  const query = form.querySelector('input[name="q"]');
  const category = form.querySelector('select[name="category"]');
  const tag = form.querySelector('select[name="tag"]');
  const pricing = form.querySelector('select[name="pricing"]');
  const clear = form.querySelector('[data-clear-filters]');

  const readParams = () => {
    const params = new URLSearchParams(window.location.search);
    if (query instanceof HTMLInputElement) query.value = params.get('q') ?? '';
    if (category instanceof HTMLSelectElement && params.get('category')) {
      category.value = params.get('category') ?? '';
    }
    if (tag instanceof HTMLSelectElement && params.get('tag')) tag.value = params.get('tag') ?? '';
    if (pricing instanceof HTMLSelectElement && params.get('pricing')) {
      pricing.value = params.get('pricing') ?? '';
    }
  };

  const apply = () => {
    const q = query instanceof HTMLInputElement ? query.value.trim().toLowerCase() : '';
    const categoryValue = category instanceof HTMLSelectElement ? category.value : '';
    const tagValue = tag instanceof HTMLSelectElement ? tag.value : '';
    const pricingValue = pricing instanceof HTMLSelectElement ? pricing.value : '';
    let shown = 0;

    for (const tool of tools) {
      if (!(tool instanceof HTMLElement)) continue;
      const haystack = tool.dataset.search ?? '';
      const tags = (tool.dataset.tags ?? '').split(/\s+/).filter(Boolean);
      const match =
        (!q || haystack.includes(q)) &&
        (!categoryValue || tool.dataset.category === categoryValue) &&
        (!tagValue || tags.includes(tagValue)) &&
        (!pricingValue || tool.dataset.pricing === pricingValue);
      tool.hidden = !match;
      if (match) shown += 1;
    }

    if (visibleCount) visibleCount.textContent = String(shown);
    if (empty instanceof HTMLElement) empty.hidden = shown !== 0;

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryValue) params.set('category', categoryValue);
    if (tagValue) params.set('tag', tagValue);
    if (pricingValue) params.set('pricing', pricingValue);
    const next = params.toString();
    const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  readParams();
  apply();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    apply();
  });
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  clear?.addEventListener('click', () => {
    if (query instanceof HTMLInputElement) query.value = '';
    if (category instanceof HTMLSelectElement) category.value = '';
    if (tag instanceof HTMLSelectElement) tag.value = '';
    if (pricing instanceof HTMLSelectElement) pricing.value = '';
    apply();
  });
}
