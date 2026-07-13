export {};

const FILTER_KEYS = ["subject", "chapter", "type", "tag", "image", "explanation"] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

function isFilterKey(value: string | undefined): value is FilterKey {
  return FILTER_KEYS.includes(value as FilterKey);
}

function getControls(): HTMLSelectElement[] {
  return Array.from(document.querySelectorAll<HTMLSelectElement>("[data-filter]")).filter((control) =>
    isFilterKey(control.dataset.filter)
  );
}

function getCardValue(card: HTMLElement, key: FilterKey): string {
  if (key === "image") return card.dataset.hasImage ?? "";
  if (key === "explanation") return card.dataset.hasExplanation ?? "";
  if (key === "tag") return card.dataset.tags ?? "";
  return card.dataset[key] ?? "";
}

function cardMatches(card: HTMLElement, filters: URLSearchParams): boolean {
  for (const key of FILTER_KEYS) {
    const filterValue = filters.get(key);
    if (!filterValue) continue;

    const cardValue = getCardValue(card, key);
    if (key === "tag") {
      const tags = cardValue.split(",").map((tag) => tag.trim());
      if (!tags.includes(filterValue)) return false;
      continue;
    }

    if (cardValue !== filterValue) return false;
  }

  return true;
}

function readFiltersFromControls(): URLSearchParams {
  const params = new URLSearchParams(window.location.search);
  for (const control of getControls()) {
    const key = control.dataset.filter;
    if (!isFilterKey(key)) continue;

    if (control.value) {
      params.set(key, control.value);
    } else {
      params.delete(key);
    }
  }
  params.delete("page");
  return params;
}

function syncControls(params: URLSearchParams): void {
  for (const control of getControls()) {
    const key = control.dataset.filter;
    if (!isFilterKey(key)) continue;
    control.value = params.get(key) ?? "";
  }
}

function updateUrl(params: URLSearchParams): void {
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

function applyFilters(params: URLSearchParams): void {
  let visibleCount = 0;
  document.querySelectorAll<HTMLElement>("[data-question-card]").forEach((card) => {
    const visible = cardMatches(card, params);
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  document.querySelectorAll<HTMLElement>("[data-filter-count], [data-result-count]").forEach((target) => {
    target.textContent = String(visibleCount);
  });
}

function togglePanel(open: boolean): void {
  document.body.classList.toggle("filter-panel-open", open);
  document.querySelectorAll<HTMLElement>("[data-filter-panel]").forEach((panel) => {
    panel.dataset.open = String(open);
    panel.classList.toggle("is-open", open);
  });
}

function init(): void {
  const initialParams = new URLSearchParams(window.location.search);
  syncControls(initialParams);
  applyFilters(initialParams);

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement) || !target.matches("[data-filter]")) return;

    const params = readFiltersFromControls();
    updateUrl(params);
    applyFilters(params);
    if (window.matchMedia("(max-width: 820px)").matches) togglePanel(false);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest("[data-filter-reset]")) {
      const params = new URLSearchParams(window.location.search);
      for (const key of FILTER_KEYS) params.delete(key);
      params.delete("page");
      syncControls(params);
      updateUrl(params);
      applyFilters(params);
      return;
    }

    if (target.closest("[data-filter-open]")) {
      togglePanel(true);
      return;
    }

    if (target.closest("[data-filter-close]")) togglePanel(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") togglePanel(false);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
